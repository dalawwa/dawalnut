import { Stack, StackProps, aws_codepipeline_actions, aws_codebuild} from "aws-cdk-lib";
import { Construct } from "constructs";

import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new codepipeline.Pipeline(this, 'CodePipeline');
    const artifact = new codepipeline.Artifact('Source');

    pipeline.addStage({
      stageName: 'Dev',
    });

    pipeline.stage('Dev').addAction(new aws_codepipeline_actions.CodeStarConnectionsSourceAction({
      actionName: 'GitHub',
      owner: 'dalawwa',
      repo: 'dawalnut',
      branch: 'main',
      output: artifact,
      connectionArn: process.env.CONNECTION_ARN!,
      runOrder: 1,
    }));

    const buildOutput = new codepipeline.Artifact('BuildOutput');
    const buildStage = pipeline.addStage({ stageName: 'Build' });
    const buildAction = new aws_codepipeline_actions.CodeBuildAction({
      runOrder: 2,
      actionName: 'Build',
      input: artifact,
      project: new aws_codebuild.Project(this, 'CodeBuild', {
        environment: {
          buildImage: aws_codebuild.LinuxBuildImage.STANDARD_7_0,
        },
        buildSpec: aws_codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              "runtime-versions": {
                "nodejs": '18.x'
              },
              commands: [
                'node -v',
                'npm i -g npm@9.5.1',
                'npm -v',
                'npm ci',
              ],
            },
            build: {
              commands: [
                'npm run build',
                'npm run synth',
              ],
            },
        }}),
      }),
      outputs: [buildOutput],
    });

    buildStage.addAction(buildAction);

    // const deployOutput = new codepipeline.Artifact('DeployOutput');
    // const deployStage = pipeline.addStage({ stageName: 'Deploy' });
    // const deployAction = new aws_codepipeline_actions.CloudFormationCreateUpdateStackAction({
    //   actionName: 'Deploy',
    //   templatePath: buildOutput.atPath('Hosting.template.json'),
    //   stackName: 'Hosting',
    //   adminPermissions: true,
    // });


    const approveStage = pipeline.addStage({ stageName: 'Approve' });
    const manualApprovalAction = new aws_codepipeline_actions.ManualApprovalAction({
      actionName: 'Approve',
      runOrder: 3,
    });
    approveStage.addAction(manualApprovalAction)
  }
}