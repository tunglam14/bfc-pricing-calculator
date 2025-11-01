import type { PricingData, ApiCalculationRequest, ApiCalculationResponse } from '../types';

// This function acts as the core logic for your backend API endpoint.
// It takes the request body and the full pricing data to compute the estimate.
export function calculateEstimate(request: ApiCalculationRequest, pricing: PricingData, t: (key: string) => string): ApiCalculationResponse {
  const { items, billingCycle = 1, discountPercent = 0 } = request;

  let monthlyTotal = 0;
  const calculatedItems: ApiCalculationResponse['calculatedItems'] = [];

  for (const item of items) {
    let pricePerUnit = 0;
    switch (item.id) {
      case 'CloudServer':
        pricePerUnit = calculateCloudServer(item.options, pricing);
        break;
      case 'CloudVps':
        pricePerUnit = calculateCloudVps(item.options, pricing);
        break;
      case 'Database':
        pricePerUnit = calculateDatabase(item.options, pricing);
        break;
      case 'SimpleStorage':
        pricePerUnit = calculateSimpleStorage(item.options, pricing);
        break;
      case 'BlockStorage':
        pricePerUnit = calculateBlockStorage(item.options, pricing);
        break;
      case 'LoadBalancer':
        pricePerUnit = calculateLoadBalancer(item.options, pricing);
        break;
      case 'Kubernetes':
        pricePerUnit = calculateKubernetes(item.options, pricing);
        break;
      case 'ContainerRegistry':
        pricePerUnit = calculateContainerRegistry(item.options, pricing);
        break;
      case 'Kafka':
        pricePerUnit = calculateKafka(item.options, pricing);
        break;
      case 'CallCenter':
        pricePerUnit = calculateCallCenter(item.options, pricing);
        break;
      case 'BusinessEmail':
        pricePerUnit = calculateBusinessEmail(item.options, pricing);
        break;
      case 'EmailTransaction':
        pricePerUnit = calculateEmailTransaction(item.options, pricing);
        break;
      case 'LMS':
        pricePerUnit = calculateLMS(item.options, pricing);
        break;
      case 'CDN':
        pricePerUnit = calculateCdn(item.options, pricing);
        break;
      case 'Vpn':
        pricePerUnit = calculateVpn(item.options, pricing);
        break;
      case 'WAF':
        pricePerUnit = calculateWaf(item.options, pricing);
        break;
      case 'WanIp':
        pricePerUnit = calculateWanIp(item.options, pricing);
        break;
      case 'Snapshot':
        pricePerUnit = calculateSnapshot(item.options, pricing);
        break;
      case 'BackupSchedule':
        pricePerUnit = calculateBackupSchedule(item.options, pricing);
        break;
      case 'CustomImage':
        pricePerUnit = calculateCustomImage(item.options, pricing);
        break;
      default:
        pricePerUnit = 0;
    }
    
    const quantity = item.quantity || 1;
    monthlyTotal += pricePerUnit * quantity;
    
    calculatedItems.push({
      service: t(`services.${item.id}`),
      quantity,
      pricePerUnit,
      totalPrice: pricePerUnit * quantity,
    });
  }

  const subtotal = monthlyTotal * billingCycle;
  const vat = subtotal * 0.10;
  const discountAmount = subtotal * (discountPercent / 100);
  const grandTotal = subtotal + vat - discountAmount;

  return {
    subtotal: Math.round(subtotal),
    vat: Math.round(vat),
    discountAmount: Math.round(discountAmount),
    grandTotal: Math.round(grandTotal),
    calculatedItems,
  };
}


// --- Individual Service Calculation Functions ---

function calculateCloudServer(options: any, pricing: PricingData): number {
  const { cloudServer: cloudServerPricing, blockStorage: blockStoragePricing } = pricing;
  const { 
    chipModel = 'intelGen2', 
    billingMethod = 'subscription', 
    tier = 'basic', 
    cpuCores, 
    ramGb, 
    diskType = 'ssd',
    diskSize = 10,
    hours = 720,
    externalDisks = []
  } = options;

  let singleItemTotal = 0;
  const currentPricingTier = cloudServerPricing[chipModel]?.[billingMethod]?.[tier];
  if (!currentPricingTier) return 0;
  
  const diskSizeNum = parseInt(String(diskSize), 10);
  const hoursNum = parseInt(String(hours), 10);

  // Base Server
  if (billingMethod === 'subscription') {
      const cpuPrice = currentPricingTier.cpu?.find((c: any) => c.cores === cpuCores)?.price || 0;
      const ramPrice = currentPricingTier.ram?.find((r: any) => r.gb === ramGb)?.price || 0;
      singleItemTotal += cpuPrice + ramPrice;
  } else {
      const effectiveHours = Math.min(hoursNum, 720);
      const cpuPrice = currentPricingTier.cpu?.find((c: any) => c.cores === cpuCores)?.on || 0;
      const ramPrice = currentPricingTier.ram?.find((r: any) => r.gb === ramGb)?.on || 0;
      singleItemTotal += (cpuPrice + ramPrice) * effectiveHours;
  }

  // Root Disk
  const rootDiskPricing = currentPricingTier.disk?.[diskType];
  if (rootDiskPricing) {
      let diskCost = (diskSizeNum <= 100)
          ? rootDiskPricing.under100GB * diskSizeNum
          : (rootDiskPricing.under100GB * 100) + (rootDiskPricing.over100GB * (diskSizeNum - 100));
      if (billingMethod === 'onDemand') diskCost *= Math.min(hoursNum, 720);
      singleItemTotal += diskCost;
  }
  
  // External Disks
  const externalTierPricing = blockStoragePricing[billingMethod]?.[tier];
  if(externalTierPricing) {
    for (const disk of externalDisks) {
        const extDiskSizeNum = parseInt(String(disk.diskSize), 10) || 10;
        const extDiskQuantityNum = parseInt(String(disk.quantity), 10) || 1;
        const diskPricing = externalTierPricing[disk.diskType];
        if (diskPricing) {
            let singleDiskCost = (extDiskSizeNum <= 100)
                ? diskPricing.under100GB * extDiskSizeNum
                : (diskPricing.under100GB * 100) + (diskPricing.over100GB * (extDiskSizeNum - 100));
            if (billingMethod === 'onDemand') singleDiskCost *= Math.min(hoursNum, 720);
            singleItemTotal += singleDiskCost * extDiskQuantityNum;
        }
    }
  }

  return Math.round(singleItemTotal);
}

function calculateCloudVps(options: any, pricing: PricingData): number {
    const { cloudVps: cloudVpsPricing } = pricing;
    const { packageId } = options;
    const selectedPackage = cloudVpsPricing.packages.find((p: any) => p.id === packageId);
    return selectedPackage?.price || 0;
}

function calculateDatabase(options: any, pricing: PricingData): number {
    const { database: dbPricing } = pricing;
    const { tier = 'premium', cpuCores, ramGB, diskSize = 10, backupSize = 0 } = options;
    const { hoursPerMonth } = dbPricing;

    let total = 0;
    const cpuPrice = dbPricing.cpu[tier]?.find((c: any) => c.cores === cpuCores)?.price || 0;
    const ramPrice = dbPricing.ram[tier]?.find((r: any) => r.gb === ramGB)?.price || 0;
    total += (cpuPrice + ramPrice) * hoursPerMonth;

    const diskSizeNum = parseInt(String(diskSize), 10);
    let diskCost = (diskSizeNum <= 100)
        ? diskSizeNum * dbPricing.disk.pricePerGBHourFirst100GB
        : (100 * dbPricing.disk.pricePerGBHourFirst100GB) + ((diskSizeNum - 100) * dbPricing.disk.pricePerGBHourAfter100GB);
    total += diskCost * hoursPerMonth;

    const backupSizeNum = parseInt(String(backupSize), 10);
    if(backupSizeNum > 0) {
        total += backupSizeNum * dbPricing.backup.pricePerGBHour * hoursPerMonth;
    }
    
    return Math.round(total);
}

function calculateSimpleStorage(options: any, pricing: PricingData): number {
    const { simpleStorage: ssPricing } = pricing;
    const { storageType = 'standard', billingModel = 'subscription', storageAmount = 1, subscriptionPackageGB, dataTransfer = 0 } = options;
    let total = 0;
    
    if(billingModel === 'subscription') {
        const pkg = ssPricing.subscription[storageType]?.find((p: any) => p.gb === subscriptionPackageGB);
        total += pkg?.price || 0;
    } else {
        const paygPrice = ssPricing.payAsYouGo[storageType].pricePerGBHour;
        total += parseInt(String(storageAmount), 10) * paygPrice * 720;
    }

    total += parseInt(String(dataTransfer), 10) * ssPricing.dataTransferPricePerGB;
    return Math.round(total);
}

function calculateBlockStorage(options: any, pricing: PricingData): number {
    const { blockStorage: bsPricing } = pricing;
    const { billingMethod = 'subscription', tier = 'basic', diskType = 'hdd', diskSize = 10, hours = 720 } = options;

    const diskSizeNum = parseInt(String(diskSize), 10);
    const diskPricing = bsPricing[billingMethod]?.[tier]?.[diskType];
    if(!diskPricing) return 0;

    let total = (diskSizeNum <= 100)
        ? diskPricing.under100GB * diskSizeNum
        : (diskPricing.under100GB * 100) + (diskPricing.over100GB * (diskSizeNum - 100));

    if(billingMethod === 'onDemand') {
        total *= Math.min(parseInt(String(hours), 10), 720);
    }
    
    return Math.round(total);
}

function calculateLoadBalancer(options: any, pricing: PricingData): number {
    const { loadBalancer: lbPricing } = pricing;
    const { packageName, dataOverage = 0 } = options;
    let total = 0;

    const pkg = lbPricing.packages.find((p: any) => p.name === packageName);
    if(pkg) total += pkg.price;

    total += parseInt(String(dataOverage), 10) * lbPricing.dataTransferOveragePricePerGB;
    return Math.round(total);
}

function calculateKubernetes(options: any, pricing: PricingData): number {
    const { kubernetes: k8sPricing } = pricing;
    const { planType = 'standard', packageName } = options;
    const pkg = k8sPricing[planType]?.find((p: any) => p.name === packageName);
    return pkg?.price || 0;
}

function calculateContainerRegistry(options: any, pricing: PricingData): number {
    const { containerRegistry: crPricing } = pricing;
    const { storage = 0, dataTransfer = 0 } = options;
    const storageCost = parseInt(String(storage), 10) * crPricing.storagePricePerGBHour * crPricing.hoursPerMonth;
    const transferCost = parseInt(String(dataTransfer), 10) * crPricing.dataTransferPricePerGB;
    return Math.round(storageCost + transferCost);
}

function calculateKafka(options: any, pricing: PricingData): number {
    const { kafka: kafkaPricing } = pricing;
    const { tier = 'premium', packageIndex = 0, diskSize = 10, hasWanIp = false } = options;
    let total = 0;

    const pkg = kafkaPricing.packages[packageIndex];
    if(!pkg) return 0;

    total += kafkaPricing.cpu[tier] * pkg.cpu;
    total += kafkaPricing.ram[tier] * pkg.ram;
    total += parseInt(String(diskSize), 10) * kafkaPricing.disk.price;
    if(hasWanIp) total += kafkaPricing.wanIP.price;

    return Math.round(total);
}

function calculateCallCenter(options: any, pricing: PricingData): number {
    const { callCenter: ccPricing } = pricing;
    const { packageName } = options;
    const pkg = ccPricing.packages.find((p: any) => p.name === packageName);
    return pkg?.price || 0;
}

function calculateBusinessEmail(options: any, pricing: PricingData): number {
    const { businessEmail: bePricing } = pricing;
    const { packageId } = options;
    const pkg = bePricing.packages.find((p: any) => p.id === packageId);
    return pkg?.price || 0;
}

function calculateEmailTransaction(options: any, pricing: PricingData): number {
    const { email: emailPricing } = pricing;
    const { planType = 'shared', emailsPerMonth = 0, dedicatedPlanName } = options;

    if(planType === 'shared') {
        return parseInt(String(emailsPerMonth), 10) * emailPricing.shared.pricePerEmail;
    } else {
        const pkg = emailPricing.dedicated.find((p: any) => p.name === dedicatedPlanName);
        return pkg?.price || 0;
    }
}

function calculateLMS(options: any, pricing: PricingData): number {
    const { lms: lmsPricing } = pricing;
    const { packageName, additionalStorageGB = 0 } = options;
    let total = 0;

    const pkg = lmsPricing.packages.find((p: any) => p.name === packageName);
    if(pkg) total += pkg.price;

    const storageNum = parseInt(String(additionalStorageGB), 10);
    if(storageNum > 0) {
        const { blockSizeGB, pricePerBlock } = lmsPricing.additionalStorage;
        const blocks = Math.ceil(storageNum / blockSizeGB);
        total += blocks * pricePerBlock;
    }
    return Math.round(total);
}

function calculateCdn(options: any, pricing: PricingData): number {
    const { cdn: cdnPricing } = pricing;
    const { dataTransfer = 0 } = options;
    const dataTransferNum = parseInt(String(dataTransfer), 10);
    const effectiveData = Math.max(dataTransferNum, cdnPricing.minGB);

    let pricePerGB = cdnPricing.tiers[cdnPricing.tiers.length - 1].pricePerGB;
    for (const tier of cdnPricing.tiers) {
        if(tier.maxGB === null || effectiveData <= tier.maxGB) {
            pricePerGB = tier.pricePerGB;
            break;
        }
    }
    const calculatedPrice = effectiveData * pricePerGB;
    return Math.max(calculatedPrice, cdnPricing.minPrice);
}

function calculateVpn(options: any, pricing: PricingData): number {
    const { vpn: vpnPricing } = pricing;
    const { packageName, dataTransfer = 0 } = options;
    let total = 0;
    const pkg = vpnPricing.packages.find((p: any) => p.name === packageName);
    if(pkg) total += pkg.price;
    total += parseInt(String(dataTransfer), 10) * vpnPricing.dataTransferPricePerGB;
    return Math.round(total);
}

function calculateWaf(options: any, pricing: PricingData): number {
    const { waf: wafPricing } = pricing;
    const { requests = 0, dataTransfer = 0 } = options;
    let total = wafPricing.subscription;
    total += parseInt(String(requests), 10) * wafPricing.requestsMillion;
    total += parseInt(String(dataTransfer), 10) * wafPricing.dataTransferOutboundGB;
    return Math.round(total);
}

function calculateWanIp(options: any, pricing: PricingData): number {
    const { wanIp: wanIpPricing } = pricing;
    const { billingMethod = 'subscription' } = options;
    return wanIpPricing[billingMethod] || 0;
}

function calculateSnapshot(options: any, pricing: PricingData): number {
    const { snapshot: snapPricing, blockStorage: bsPricing } = pricing;
    const { tier = 'basic', volumeType = 'ssd', volumeSize = 10 } = options;
    
    const sizeNum = parseInt(String(volumeSize), 10);
    const diskPricing = bsPricing.subscription[tier]?.[volumeType];
    if(!diskPricing) return 0;

    const blockStorageCost = (sizeNum <= 100)
        ? diskPricing.under100GB * sizeNum
        : (diskPricing.under100GB * 100) + (diskPricing.over100GB * (sizeNum - 100));
    
    return Math.round(blockStorageCost * snapPricing.costPercentageOfBlockStorage);
}

function calculateBackupSchedule(options: any, pricing: PricingData): number {
    return pricing.backupSchedule.price;
}

function calculateCustomImage(options: any, pricing: PricingData): number {
    const { customImage: ciPricing } = pricing;
    const { size = 1 } = options;
    return parseInt(String(size), 10) * ciPricing.pricePerGB;
}
