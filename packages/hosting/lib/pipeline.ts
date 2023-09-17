import { Stack, StackProps, pipelines } from "aws-cdk-lib";
import { Construct } from "constructs";

import { DevStage } from "./stage-dev";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      codeBuildDefaults: {
        rolePolicy: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['*'],
            resources: ['*'],
          }),
        ],
      },
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection('dalawwa/dawalnut', 'main', {
          connectionArn: process.env.CONNECTION_ARN!,
        }),
        installCommands: ['npm i -g npm@9.6.7'],
        commands: [
          'node -v',
          'npm ci',
          'npm run build -w hosting',
          'npm run synth -w hosting',
        ],
        primaryOutputDirectory: 'packages/hosting/cdk.out',
      }),
    });

    pipeline.addStage(new DevStage(this, 'Dev', {
      env: {
        account: '765757105156',
        region: 'eu-central-1',
      }
    }));
  }
}