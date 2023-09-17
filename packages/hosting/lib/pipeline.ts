import { Stack, StackProps, pipelines } from "aws-cdk-lib";
import { Construct } from "constructs";

import { DevStage } from "./stage-dev";
export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection('dalawwa/dawalnut', 'main', {
          connectionArn: process.env.CONNECTION_ARN!,
        }),
        installCommands: ['npm i -g npm@9.6.7'],
        commands: [
          'node -v',
          'npm ci -w hosting',
          'npm run build:hosting',
          'npx cdk synth:hosting',
        ],
        primaryOutputDirectory: 'packages/hosting/cdk.out',
      }),
    });

    pipeline.addStage(new DevStage(this, 'Dev'));
  }
}