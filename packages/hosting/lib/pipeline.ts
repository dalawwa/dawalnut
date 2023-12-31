import { Stack, StackProps } from "aws-cdk-lib";
import { LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";
import { CodePipeline, ShellStep, CodePipelineSource, ManualApprovalStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import "dotenv/config"
import { Stage } from "./stage";
import { CompositePrincipal, Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const role = new Role(this, 'Role', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('codebuild.amazonaws.com'),
        new ServicePrincipal('codepipeline.amazonaws.com'),
      )
    });

    role.addToPolicy(new PolicyStatement({
      actions: [
        'codebuild:*',
        'codepipeline:*',
        'sts:*',
        's3:*',
        'cloudformation:*',
        'ssm:*',
      ],
      resources: ['*'],
      effect: Effect.ALLOW
    }));
    const pipeline = new CodePipeline(this, 'Pipeline', {
      role,
      pipelineName: 'CdkPipeline',
      synth: new ShellStep('Synth', {
        primaryOutputDirectory: 'packages/hosting/cdk.out',
        input: CodePipelineSource.connection('dalawwa/dawalnut', 'main', {
          connectionArn: process.env.CONNECTION_ARN!,
        }),
        env: {
          'CONNECTION_ARN': process.env.CONNECTION_ARN!,
          AWS_ACCOUNT: process.env.AWS_ACCOUNT!,
          AWS_REGION: process.env.AWS_REGION!,
        },
        installCommands: [
          'npm install -g npm@9.5.1',
        ],
        commands: [
          'cd packages/hosting',
          'npm ci',
          'npm run build',
          'echo ${CODEBUILD_SRC_DIR}',
          'ls -la ${CODEBUILD_SRC_DIR}',
          'npm run synth',
        ],
      }),
      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: LinuxBuildImage.AMAZON_LINUX_2_5,
        },
      },
    });

    pipeline.addStage(new Stage(this, 'Dev'), {
      post: [
        new ManualApprovalStep('Approval')
      ]
    });

    pipeline.addStage(new Stage(this, 'Prod'));
  }
}