import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './components/Header';
import CostSummary from './components/CostSummary';
import CloudServerCalculator from './components/calculators/CloudServerCalculator';
import CloudVpsCalculator from './components/calculators/CloudVpsCalculator';
import DatabaseCalculator from './components/calculators/DatabaseCalculator';
import SimpleStorageCalculator from './components/calculators/SimpleStorageCalculator';
import CallCenterCalculator from './components/calculators/CallCenterCalculator';
import EmailCalculator from './components/calculators/EmailCalculator';
import LoadBalancerCalculator from './components/calculators/LoadBalancerCalculator';
import KubernetesCalculator from './components/calculators/KubernetesCalculator';
import KafkaCalculator from './components/calculators/KafkaCalculator';
import ContainerRegistryCalculator from './components/calculators/ContainerRegistryCalculator';
import BusinessEmailCalculator from './components/calculators/BusinessEmailCalculator';
import BlockStorageCalculator from './components/calculators/BlockStorageCalculator';
import LMSCalculator from './components/calculators/LMSCalculator';
import WanIpCalculator from './components/calculators/WanIpCalculator';
import SnapshotCalculator from './components/calculators/SnapshotCalculator';
import BackupScheduleCalculator from './components/calculators/BackupScheduleCalculator';
import CustomImageCalculator from './components/calculators/CustomImageCalculator';
import CdnCalculator from './components/calculators/CdnCalculator';
import VpnCalculator from './components/calculators/VpnCalculator';
import WafCalculator from './components/calculators/WafCalculator';
import ApiDocs from './components/ApiDocs';
import type { EstimateItem, Service, ServiceId } from './types';
import { useLanguage } from './i18n/LanguageContext';
import { usePricing } from './contexts/PricingContext';

// Icons for the service selector
const serviceIcons: Record<ServiceId, React.ReactNode> = {
  CloudServer: <img src="/assets/icons/cloudserver.svg" alt="Cloud Server" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  CloudVps: <img src="/assets/icons/cloudvps.svg" alt="Cloud VPS" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  Database: <img src="/assets/icons/icon-database.svg" alt="Database" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  SimpleStorage: <img src="/assets/icons/icon-simple-storage.svg" alt="Simple Storage" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  BlockStorage: <img src="/assets/icons/icon-block-storage.svg" alt="Block Storage" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  LoadBalancer: <img src="/assets/icons/icon-load-balancer.svg" alt="Load Balancer" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  Kubernetes: <img src="/assets/icons/icon-kubernetes-engine.svg" alt="Kubernetes" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  ContainerRegistry: <img src="/assets/icons/icon-container-registry.svg" alt="Container Registry" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  Kafka: <img src="/assets/icons/icon-kafka-cloud.svg" alt="Kafka" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  CallCenter: <img src="/assets/icons/icon-call-center.svg" alt="Call Center" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  BusinessEmail: <img src="/assets/icons/icon-business-email.svg" alt="Business Email" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  EmailTransaction: <img src="/assets/icons/icon-email-transaction.svg" alt="Email Transaction" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  LMS: <img src="/assets/icons/icon-lms.svg" alt="LMS" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  WanIp: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9h18" /></svg>,
  Snapshot: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  BackupSchedule: <img src="/assets/icons/icon-cloud-backup.svg" alt="Backup Schedule" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  CustomImage: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  CDN: <img src="/assets/icons/CDN.svg" alt="CDN" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  Vpn: <img src="/assets/icons/icon-vpn.svg" alt="VPN" className="h-8 w-8 mx-auto mb-2 object-contain" />,
  WAF: <img src="/assets/icons/icon-waf.svg" alt="Cloud WAF" className="h-8 w-8 mx-auto mb-2 object-contain" />,
};
const serviceIds: ServiceId[] = [
    'CloudServer', 'CloudVps', 'Database', 'SimpleStorage', 'BlockStorage', 'LoadBalancer', 'Kubernetes', 'ContainerRegistry', 'Kafka', 'CallCenter', 'BusinessEmail', 'EmailTransaction', 'LMS', 'CDN', 'Vpn', 'WAF', 'WanIp', 'Snapshot', 'BackupSchedule', 'CustomImage'
];

const App: React.FC = () => {
  const { t } = useLanguage();
  const { pricing, isLoading } = usePricing();
  const [activeService, setActiveService] = useState<ServiceId>('CloudServer');
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [billingCycle, setBillingCycle] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [showApiDocs, setShowApiDocs] = useState(false);

  useEffect(() => {
    if (billingCycle === 1) {
      setDiscount(0);
    }
  }, [billingCycle]);

  const services: Service[] = useMemo(() => serviceIds.map(id => ({
      id,
      name: t(`services.${id}`),
      icon: serviceIcons[id]
  })), [t]);

  const handleAddItem = useCallback((item: EstimateItem) => {
    setEstimateItems(prevItems => [...prevItems, item]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setEstimateItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setEstimateItems([]);
  }, []);
  
  const handleServiceClick = (serviceId: ServiceId) => {
    setActiveService(serviceId);
  };


  const activeCalculator = useMemo(() => {
    if (!pricing) return null;
    switch (activeService) {
      case 'CloudServer': return <CloudServerCalculator onAddItem={handleAddItem} />;
      case 'CloudVps': return <CloudVpsCalculator onAddItem={handleAddItem} />;
      case 'Database': return <DatabaseCalculator onAddItem={handleAddItem} />;
      case 'SimpleStorage': return <SimpleStorageCalculator onAddItem={handleAddItem} />;
      case 'BlockStorage': return <BlockStorageCalculator onAddItem={handleAddItem} />;
      case 'LoadBalancer': return <LoadBalancerCalculator onAddItem={handleAddItem} />;
      case 'Kubernetes': return <KubernetesCalculator onAddItem={handleAddItem} />;
      case 'ContainerRegistry': return <ContainerRegistryCalculator onAddItem={handleAddItem} />;
      case 'Kafka': return <KafkaCalculator onAddItem={handleAddItem} />;
      case 'CallCenter': return <CallCenterCalculator onAddItem={handleAddItem} />;
      case 'BusinessEmail': return <BusinessEmailCalculator onAddItem={handleAddItem} />;
      case 'EmailTransaction': return <EmailCalculator onAddItem={handleAddItem} />;
      case 'LMS': return <LMSCalculator onAddItem={handleAddItem} />;
      case 'CDN': return <CdnCalculator onAddItem={handleAddItem} />;
      case 'Vpn': return <VpnCalculator onAddItem={handleAddItem} />;
      case 'WAF': return <WafCalculator onAddItem={handleAddItem} />;
      case 'WanIp': return <WanIpCalculator onAddItem={handleAddItem} />;
      case 'Snapshot': return <SnapshotCalculator onAddItem={handleAddItem} />;
      case 'BackupSchedule': return <BackupScheduleCalculator onAddItem={handleAddItem} />;
      case 'CustomImage': return <CustomImageCalculator onAddItem={handleAddItem} />;
      default: return null;
    }
  }, [activeService, handleAddItem, pricing]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="text-gray-700 mt-2">Failed to load critical pricing data. Please check your network connection and refresh the page.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header onToggleDocs={() => setShowApiDocs(!showApiDocs)} isDocsVisible={showApiDocs} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showApiDocs ? (
          <ApiDocs />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-2/3 xl:w-3/4 space-y-8">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">{t('services.select_service')}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {services.map(service => (
                          <button
                              key={service.id}
                              onClick={() => handleServiceClick(service.id)}
                              className={`p-4 rounded-lg text-center transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 cta-bfc-pc-${service.id.toLowerCase()} ${
                                  activeService === service.id
                                  ? 'bg-blue-700 text-white shadow-md' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                              <div className={`transition-colors duration-200 ${activeService === service.id ? 'text-white' : 'text-blue-700'}`}>
                                  {service.icon}
                              </div>
                              <span className="text-sm font-semibold block">{service.name}</span>
                          </button>
                      ))}
                  </div>
              </div>
              
              {activeCalculator}
            </div>
            
            <CostSummary
              items={estimateItems}
              onRemoveItem={handleRemoveItem}
              onClearAll={handleClearAll}
              billingCycle={billingCycle}
              onBillingCycleChange={setBillingCycle}
              discount={discount}
              onDiscountChange={setDiscount}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;