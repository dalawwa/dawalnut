import { SecretValue, Stack, StackProps, pipelines } from "aws-cdk-lib";
import { Construct } from "constructs";

import { DevStage } from "./stage-dev";
export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('dalawwa/dawalnut', 'main', {
          authentication: SecretValue.secretsManager('github-token-dawalnut'),
        }),
        installCommands: ['npm i -g npm@latest'],
        commands: [
          'npm ci -w hosting',
          'npm run build -w hosting',
          'npx cdk synth -w hosting',
        ],
        primaryOutputDirectory: 'packages/hosting/cdk.out',
      }),
    });

    pipeline.addStage(new DevStage(this, 'Dev'));
  }
}