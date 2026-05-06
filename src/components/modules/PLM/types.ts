export interface PLMProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  lifecycleStage: string;
  status: string;
  version: string;
  owner: string;
  lastUpdated: string;
  createdAt: string;
  description: string;
  bomRef: string;
  revisionCount: number;
}

export interface PLMRevision {
  id: string;
  productId: string;
  productName: string;
  version: string;
  description: string;
  author: string;
  date: string;
  status: string;
  changeType: string;
  affectedComponents: string;
}

export interface PLMDocument {
  id: string;
  title: string;
  productId: string;
  productName: string;
  docType: string;
  version: string;
  status: string;
  author: string;
  date: string;
  hasFile: boolean;
  size: string;
}

export interface PLM_ECR {
  id: string;
  number: string;
  productId: string;
  productName: string;
  description: string;
  priority: string;
  requester: string;
  status: string;
  justification: string;
  affectedAreas: string;
  createdAt: string;
  convertedToECO: boolean;
  ecoNumber: string | null;
}

export interface PLM_ECO {
  id: string;
  ecrNumber: string;
  productName: string;
  implementationPlan: string;
  assignedTeam: string;
  targetDate: string;
  completion: number;
  status: string;
  approvalChain: string[];
}
