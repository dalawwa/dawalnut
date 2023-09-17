import { Stack, StackProps, aws_codepipeline_actions, aws_codebuild} from "aws-cdk-lib";
import { LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";
import { CodePipeline, ShellStep, CodePipelineSource } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import "dotenv/config"
import { Stage } from "./stage";

export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CdkPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('dalawwa/dawalnut', 'main', {
          connectionArn: process.env.CONNECTION_ARN!,
        }),
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

    pipeline.addStage(new Stage(this, 'Dev', {
      env: {
        account: process.env.AWS_ACCOUNT!,
        region: process.env.AWS_REGION!,
      },
    }));

    pipeline.addStage(new Stage(this, 'Prod', {
      env: {
        account: process.env.AWS_ACCOUNT!,
        region: process.env.AWS_REGION!,
      },
    }));
  }
}