import { Stack, StackProps, aws_codepipeline_actions, aws_codebuild} from "aws-cdk-lib";
import { Construct } from "constructs";

import { Stage } from "./stage";
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new codepipeline.Pipeline(this, 'CodePipeline');

    pipeline.addStage(new Stage(this, 'Dev', {
      stageName: 'Dev',
      env: {
        account: '765757105156',
        region: 'eu-central-1',
      }
    }));

    pipeline.stage('Dev').addAction(new aws_codepipeline_actions.CodeStarConnectionsSourceAction({
      actionName: 'GitHub',
      owner: 'dalawwa',
      repo: 'dawalnut',
      branch: 'main',
      output: new codepipeline.Artifact(),
      connectionArn: process.env.CONNECTION_ARN!,
    }));

    const buildStage = pipeline.addStage({ stageName: 'Build' });
    const buildAction = new aws_codepipeline_actions.CodeBuildAction({
      actionName: 'Build',
      input: new codepipeline.Artifact(),
      project: new aws_codebuild.Project(this, 'CodeBuild', {
        buildSpec: aws_codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              commands: [
                'npm install -g npm@latest',
                'npm ci',
              ],
            },
            build: {
              commands: [
                'npm run build -w hosting',
                'npm run synth -w hosting',
              ],
            },
        }}),
        badge: true,
      }),
    });

    buildStage.addAction(buildAction);

    const approveStage = pipeline.addStage({ stageName: 'Approve' });
    const manualApprovalAction = new aws_codepipeline_actions.ManualApprovalAction({
      actionName: 'Approve',
    });
    approveStage.addAction(manualApprovalAction)
  }
}