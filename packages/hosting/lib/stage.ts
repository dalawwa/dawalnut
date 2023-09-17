import { Stage as CdkStage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { HostingStack } from "./hosting-stack";

export class Stage extends CdkStage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new HostingStack(this, "Hosting", props);
  }
}
