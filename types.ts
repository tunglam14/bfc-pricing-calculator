import type { ReactNode } from 'react';

export interface EstimateItem {
  id: string;
  service: string;
  descriptionKey: string;
  descriptionOptions: Record<string, string | number>;
  price: number;
  quantity: number;
}

export type ServiceId = 
  | 'CloudServer'
  | 'CloudVps'
  | 'Database' 
  | 'SimpleStorage' 
  | 'BlockStorage'
  | 'LoadBalancer' 
  | 'Kubernetes'
  | 'ContainerRegistry'
  | 'Kafka' 
  | 'CallCenter' 
  | 'BusinessEmail' 
  | 'EmailTransaction'
  | 'LMS'
  | 'WanIp'
  | 'Snapshot'
  | 'BackupSchedule'
  | 'CustomImage'
  | 'CDN'
  | 'Vpn'
  | 'WAF';

export interface Service {
  id: ServiceId;
  name: string;
  icon: ReactNode;
}

// Types for the calculation API
export interface ApiCalculationRequest {
  billingCycle?: number;
  discountPercent?: number;
  items: ApiEstimateItem[];
}

export interface ApiEstimateItem {
  id: ServiceId;
  quantity: number;
  options: any; // Using 'any' for flexibility, but specific option types can be defined.
}

export interface ApiCalculationResponse {
  subtotal: number;
  vat: number;
  discountAmount: number;
  grandTotal: number;
  calculatedItems: {
    service: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
  }[];
}

export interface PricingData {
  blockStorage: any;
  businessEmail: any;
  callCenter: any;
  cloudServer: any;
  cloudVps: any;
  containerRegistry: any;
  customImage: any;
  database: any;
  email: any;
  kafka: any;
  kubernetes: any;
  lms: any;
  loadBalancer: any;
  simpleStorage: any;
  snapshot: any;
  wanIp: any;
  backupSchedule: any;
  cdn: any;
  vpn: any;
  waf: any;
}
