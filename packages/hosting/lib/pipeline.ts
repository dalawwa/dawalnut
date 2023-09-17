import { Stack, StackProps, pipelines } from "aws-cdk-lib";
import { Construct } from "constructs";

import { DevStage } from "./stage-dev";
export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.CodeBuildStep('Synth', {
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
    pipeline.synthProject.role?.addManagedPolicy({
      managedPolicyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
    });

    pipeline.addStage(new DevStage(this, 'Dev', {
      env: {
        account: '765757105156',
        region: 'eu-central-1',
      }
    }));
  }
}