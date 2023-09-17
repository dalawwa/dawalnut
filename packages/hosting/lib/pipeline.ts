import { Stack, StackProps, pipelines } from "aws-cdk-lib";
import { Construct } from "constructs";

import { DevStage } from "./stage-dev";
import { CompositePrincipal, Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const role = new Role(this, "pipeline", {
      roleName: "pipeline",
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("codebuild.amazonaws.com"),
        new ServicePrincipal("codepipeline.amazonaws.com"),
        )
    })
    const policyStatement = new PolicyStatement({
        actions: [
          "s3:GetObject*",
          "s3:GetBucket*",
          "s3:List*",
          "s3:DeleteObject*",
          "s3:PutObject",
          "s3:Abort*",
      ],
      effect: Effect.ALLOW,
      resources: [
          "*"
      ],
    });

    role.addToPolicy(
        policyStatement,
    );
    role.addToPolicy(
      new PolicyStatement({
        actions: ['sts:AssumeRole'],
        effect: Effect.ALLOW,
        resources: [process.env.PIPELINE_ROLE_ARN!],
      })
    )
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      role: role.withoutPolicyUpdates(),
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection('dalawwa/dawalnut', 'main', {
          connectionArn: process.env.CONNECTION_ARN!,
        }),
        installCommands: ['npm i -g npm@9.6.7'],
        commands: [
          'node -v',
          'npm ci -w hosting',
          'npm run build -w hosting',
          'npm run synth -w hosting',
        ],
        primaryOutputDirectory: 'packages/hosting/cdk.out',
      }),
      dockerEnabledForSynth: true
    });

    pipeline.addStage(new DevStage(this, 'Dev'));
  }
}