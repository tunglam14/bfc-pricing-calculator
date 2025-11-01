import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const CodeBlock: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof children === 'string') {
      navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg my-4">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-200 rounded-t-lg">
            <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
            <button
            onClick={handleCopy}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
            {copied ? t('api_docs.copied') : t('api_docs.copy')}
            </button>
      </div>
      <pre className="p-4 text-sm text-gray-800 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
};

const ServiceOptionsTable: React.FC<{ options: { key: string; type: string; description: string }[] }> = ({ options }) => {
    const { t } = useLanguage();
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="border border-gray-300 p-2 text-left font-semibold text-gray-600">{t('api_docs.col_option')}</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold text-gray-600">{t('api_docs.col_type')}</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold text-gray-600">{t('api_docs.col_description')}</th>
                    </tr>
                </thead>
                <tbody>
                    {options.map(opt => (
                        <tr key={opt.key}>
                            <td className="border border-gray-300 p-2"><code className="text-red-600">{opt.key}</code></td>
                            <td className="border border-gray-300 p-2"><code className="text-blue-700">{opt.type}</code></td>
                            <td className="border border-gray-300 p-2">{opt.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const ApiDocs: React.FC = () => {
  const { t } = useLanguage();

  const pricingApiEndpoints = [
    '/api/pricing/cloudServer.json',
    '/api/pricing/cloudVps.json',
    '/api/pricing/database.json',
    '/api/pricing/simpleStorage.json',
    '/api/pricing/blockStorage.json',
    '/api/pricing/loadBalancer.json',
    '/api/pricing/kubernetes.json',
    '/api/pricing/containerRegistry.json',
    '/api/pricing/kafka.json',
    '/api/pricing/callCenter.json',
    '/api/pricing/businessEmail.json',
    '/api/pricing/email.json',
    '/api/pricing/lms.json',
    '/api/pricing/cdn.json',
    '/api/pricing/vpn.json',
    '/api/pricing/waf.json',
    '/api/pricing/wanIp.json',
    '/api/pricing/snapshot.json',
    '/api/pricing/backupSchedule.json',
    '/api/pricing/customImage.json',
  ];

  const requestBodyExample = {
    "billingCycle": 1,
    "discountPercent": 0,
    "items": [
      {
        "id": "CloudServer",
        "quantity": 1,
        "options": {
          "chipModel": "intelGen2",
          "billingMethod": "subscription",
          "tier": "basic",
          "cpuCores": 4,
          "ramGb": 8,
          "diskType": "ssd",
          "diskSize": 100,
          "externalDisks": [
            { "quantity": 1, "diskType": "hdd", "diskSize": 200 }
          ]
        }
      },
      {
        "id": "Database",
        "quantity": 2,
        "options": {
          "tier": "premium",
          "cpuCores": 2,
          "ramGB": 4,
          "diskSize": 50,
          "backupSize": 10
        }
      }
    ]
  };

  const responseBodyExample = {
    "subtotal": 5834000,
    "vat": 583400,
    "discountAmount": 0,
    "grandTotal": 6417400,
    "calculatedItems": [
      {
        "service": "Cloud Server",
        "quantity": 1,
        "pricePerUnit": 1234000,
        "totalPrice": 1234000
      },
      {
        "service": "Database",
        "quantity": 2,
        "pricePerUnit": 2300000,
        "totalPrice": 4600000
      }
    ]
  };
  
  const serviceOptions: Record<string, { key: string; type: string; description: string }[]> = {
    CloudServer: [
        { key: 'chipModel', type: 'string', description: 'Chip model. Values: "amdGen4", "intelGen2". Default: "intelGen2".' },
        { key: 'billingMethod', type: 'string', description: 'Billing method. Values: "subscription", "onDemand". Default: "subscription".' },
        { key: 'tier', type: 'string', description: 'Service tier. Values depend on chip model. Default: "basic".' },
        { key: 'cpuCores', type: 'number', description: 'Number of vCPU cores. (Required)' },
        { key: 'ramGb', type: 'number', description: 'Amount of RAM in GB. (Required)' },
        { key: 'diskType', type: 'string', description: 'Root disk type. Values: "hdd", "ssd", "nvme". Default: "ssd".' },
        { key: 'diskSize', type: 'number', description: 'Root disk size in GB. Default: 10.' },
        { key: 'hours', type: 'number', description: 'Number of hours for on-demand billing. Default: 720.' },
        { key: 'externalDisks', type: 'array', description: 'Array of external disk objects. Object format: { quantity: number, diskType: string, diskSize: number }.' },
    ],
    CloudVps: [
        { key: 'packageId', type: 'number', description: 'ID of the VPS package. Refer to /api/pricing/cloudVps.json for available IDs. (Required)' },
    ],
    Database: [
        { key: 'tier', type: 'string', description: 'Service tier. Values: "premium", "enterprise", "dedicated". Default: "premium".' },
        { key: 'cpuCores', type: 'number', description: 'Number of vCPU cores. (Required)' },
        { key: 'ramGB', type: 'number', description: 'Amount of RAM in GB. (Required)' },
        { key: 'diskSize', type: 'number', description: 'Disk size in GB. Default: 10.' },
        { key: 'backupSize', type: 'number', description: 'Backup size in GB. Default: 0.' },
    ],
    SimpleStorage: [
        { key: 'storageType', type: 'string', description: 'Storage type. Values: "standard", "cold". Default: "standard".' },
        { key: 'billingModel', type: 'string', description: 'Billing model. Values: "subscription", "payg". Default: "subscription".' },
        { key: 'storageAmount', type: 'number', description: 'Storage size in GB (for "payg" model). Default: 1.' },
        { key: 'subscriptionPackageGB', type: 'number', description: 'Package size in GB (for "subscription" model). (Required for subscription)' },
        { key: 'dataTransfer', type: 'number', description: 'Data transfer out in GB. Default: 0.' },
    ],
    BlockStorage: [
        { key: 'billingMethod', type: 'string', description: 'Billing method. Values: "subscription", "onDemand". Default: "subscription".' },
        { key: 'tier', type: 'string', description: 'Service tier. Values: "basic", "premium", "enterprise", "dedicated". Default: "basic".' },
        { key: 'diskType', type: 'string', description: 'Disk type. Values: "hdd", "ssd", "nvme". Default: "hdd".' },
        { key: 'diskSize', type: 'number', description: 'Disk size in GB. Default: 10.' },
        { key: 'hours', type: 'number', description: 'Number of hours for on-demand billing. Default: 720.' },
    ],
    LoadBalancer: [
        { key: 'packageName', type: 'string', description: 'Name of the package. Values: "Small", "Medium", "Large". (Required)' },
        { key: 'dataOverage', type: 'number', description: 'Data transfer overage in GB. Default: 0.' },
    ],
    Kubernetes: [
        { key: 'planType', type: 'string', description: 'Plan type. Values: "standard", "everywhere". Default: "standard".' },
        { key: 'packageName', type: 'string', description: 'Name of the package. (Required)' },
    ],
    ContainerRegistry: [
        { key: 'storage', type: 'number', description: 'Average storage in GB per month. Default: 0.' },
        { key: 'dataTransfer', type: 'number', description: 'Data transfer out in GB per month. Default: 0.' },
    ],
    Kafka: [
        { key: 'tier', type: 'string', description: 'Service tier. Values: "premium", "enterprise", "dedicated". Default: "premium".' },
        { key: 'packageIndex', type: 'number', description: '0-based index of the package from the pricing file. Default: 0.' },
        { key: 'diskSize', type: 'number', description: 'Disk size in GB. Default: 10.' },
        { key: 'hasWanIp', type: 'boolean', description: 'Whether to include a WAN IP. Default: false.' },
    ],
    CallCenter: [
        { key: 'packageName', type: 'string', description: 'Name of the package. E.g., "V10", "V20". (Required)' },
    ],
    BusinessEmail: [
        { key: 'packageId', type: 'number', description: 'ID of the email package. Refer to /api/pricing/businessEmail.json. (Required)' },
    ],
    EmailTransaction: [
        { key: 'planType', type: 'string', description: 'Plan type. Values: "shared", "dedicated". Default: "shared".' },
        { key: 'emailsPerMonth', type: 'number', description: 'Number of emails for "shared" plan. Default: 0.' },
        { key: 'dedicatedPlanName', type: 'string', description: 'Name of the package for "dedicated" plan. E.g., "ET20".' },
    ],
    LMS: [
        { key: 'packageName', type: 'string', description: 'Name of the LMS package. E.g., "Pack 10 CCU". (Required)' },
        { key: 'additionalStorageGB', type: 'number', description: 'Additional storage in GB. Default: 0.' },
    ],
    CDN: [
        { key: 'dataTransfer', type: 'number', description: 'Data transfer volume in GB per month. Default: 0.' },
    ],
    Vpn: [
        { key: 'packageName', type: 'string', description: 'Bandwidth package name. E.g., "50 Mbps". (Required)' },
        { key: 'dataTransfer', type: 'number', description: 'Additional data transfer in GB. Default: 0.' },
    ],
    WAF: [
        { key: 'requests', type: 'number', description: 'Number of requests in millions per month. Default: 0.' },
        { key: 'dataTransfer', type: 'number', description: 'Outbound data transfer in GB per month. Default: 0.' },
    ],
    WanIp: [
        { key: 'billingMethod', type: 'string', description: 'Billing method. Values: "subscription", "onDemand". Default: "subscription".' },
    ],
    Snapshot: [
        { key: 'tier', type: 'string', description: 'Tier of the original volume. Values: "basic", "premium", "enterprise", "dedicated". Default: "basic".' },
        { key: 'volumeType', type: 'string', description: 'Type of the original volume. Values: "hdd", "ssd", "nvme". Default: "ssd".' },
        { key: 'volumeSize', type: 'number', description: 'Size of the original volume in GB. Default: 10.' },
    ],
    BackupSchedule: [
        { key: 'N/A', type: 'N/A', description: 'This service has a fixed price and does not require any options.' },
    ],
    CustomImage: [
        { key: 'size', type: 'number', description: 'Total image size in GB. Default: 1.' },
    ],
  };


  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-4 mb-6">{t('api_docs.title')}</h2>
      
      <p className="text-gray-600 mb-8">{t('api_docs.intro')}</p>

      {/* Pricing Data API Section */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">{t('api_docs.pricing_api_title')}</h3>
        <p className="text-gray-600 mb-4">{t('api_docs.pricing_api_desc')}</p>
        <div className="text-sm text-gray-500 mb-4"><strong>{t('api_docs.base_url')}</strong></div>
        
        <h4 className="text-lg font-semibold text-gray-700 mb-2">{t('api_docs.endpoints_title')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-sm">
            <ul className="list-disc list-inside text-blue-600 space-y-1">
                {pricingApiEndpoints.slice(0, Math.ceil(pricingApiEndpoints.length / 2)).map(endpoint => (
                    <li key={endpoint}><code className="text-gray-800">{`GET ${endpoint}`}</code></li>
                ))}
            </ul>
            <ul className="list-disc list-inside text-blue-600 space-y-1">
                {pricingApiEndpoints.slice(Math.ceil(pricingApiEndpoints.length / 2)).map(endpoint => (
                    <li key={endpoint}><code className="text-gray-800">{`GET ${endpoint}`}</code></li>
                ))}
            </ul>
        </div>
      </section>

      {/* Cost Calculation API Section */}
      <section>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">{t('api_docs.calc_api_title')}</h3>
        <p className="text-gray-600 mb-4">{t('api_docs.calc_api_desc')}</p>

        <h4 className="text-lg font-semibold text-gray-700 mt-6 mb-2">{t('api_docs.endpoint')}</h4>
        <CodeBlock title="POST /api/calculate">{`POST /api/calculate`}</CodeBlock>

        <div className="mt-8">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">{t('api_docs.service_details_title')}</h4>
            <p className="text-sm text-gray-600 mb-4">{t('api_docs.service_details_desc')}</p>
            <div className="space-y-8">
                {Object.entries(serviceOptions).map(([serviceId, options]) => (
                <div key={serviceId}>
                    <h5 className="text-lg font-bold text-gray-800 mb-2"><code className="text-green-700 bg-green-50 px-2 py-1 rounded">{serviceId}</code></h5>
                    <ServiceOptionsTable options={options} />
                </div>
                ))}
            </div>
        </div>


        <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-2">{t('api_docs.request_body')}</h4>
        <p className="text-sm text-gray-600 mb-2">{t('api_docs.request_body_desc')}</p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
          <li><code className="text-gray-800">billingCycle</code> (optional, number): 1, 3, 6, 12, etc. Defaults to 1.</li>
          <li><code className="text-gray-800">discountPercent</code> (optional, number): 0-90. Defaults to 0.</li>
          <li><code className="text-gray-800">items</code> (required, array): A list of service items to calculate.</li>
        </ul>
        <CodeBlock title="Request Body Example">{JSON.stringify(requestBodyExample, null, 2)}</CodeBlock>

        <h4 className="text-lg font-semibold text-gray-700 mt-6 mb-2">{t('api_docs.response_body')}</h4>
        <p className="text-sm text-gray-600 mb-2">{t('api_docs.response_body_desc')}</p>
        <CodeBlock title="Response Body Example">{JSON.stringify(responseBodyExample, null, 2)}</CodeBlock>
      </section>
    </div>
  );
};

export default ApiDocs;
