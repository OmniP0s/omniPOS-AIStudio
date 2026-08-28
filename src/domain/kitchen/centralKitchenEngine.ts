// Central Kitchen & Production Manufacturing Engine
import { ManufacturingOrder } from '../../types';

export class CentralKitchenEngine {
  private orders: ManufacturingOrder[] = [
    {
      id: 'mo-901',
      moNumber: 'MO-2026-0012',
      centralKitchenBranchId: 'b-central-kitchen',
      recipeId: 'rec-sauce-truffle',
      recipeName: 'Signature Truffle Mayo Sauce (Bulk Batch)',
      scheduledDate: '2026-08-27',
      targetOutputQty: 100, // 100 Liters
      unit: 'L',
      status: 'COOKING',
      actualOutputYieldQty: 97.5,
      wastePercentage: 2.5,
      totalCostSar: 1850,
      costPerUnitSar: 18.5,
      ingredientsUsed: [
        { inventoryItemId: 'inv-mayo-base', itemName: 'Pure Egg Mayonnaise Base', requiredQty: 80, actualQty: 80, unit: 'kg' },
        { inventoryItemId: 'inv-truffle-oil', itemName: 'Italian Black Truffle Infused Oil', requiredQty: 12, actualQty: 12, unit: 'L' },
        { inventoryItemId: 'inv-herbs', itemName: 'Herbs & Sea Salt Blend', requiredQty: 8, actualQty: 8, unit: 'kg' },
      ],
      destinationBranchAllocations: [
        { branchId: 'b1', branchName: 'Al Olaya Flagship (Riyadh)', allocatedQty: 60, transferStatus: 'DISPATCHED' },
        { branchId: 'b2', branchName: 'Jeddah Waterfront', allocatedQty: 40, transferStatus: 'PENDING' },
      ],
    },
    {
      id: 'mo-902',
      moNumber: 'MO-2026-0013',
      centralKitchenBranchId: 'b-central-kitchen',
      recipeId: 'rec-marinated-wagyu',
      recipeName: 'Smoked Wagyu Patty Blend Seasoning',
      scheduledDate: '2026-08-28',
      targetOutputQty: 300, // 300 kg
      unit: 'kg',
      status: 'PLANNED',
      actualOutputYieldQty: 0,
      wastePercentage: 1.8,
      totalCostSar: 14400,
      costPerUnitSar: 48.0,
      ingredientsUsed: [
        { inventoryItemId: 'inv-wagyu-raw', itemName: 'Prime A5 Wagyu Trim Cuts', requiredQty: 290, actualQty: 290, unit: 'kg' },
        { inventoryItemId: 'inv-secret-rub', itemName: 'Omni Woodfire Secret Spice Rub', requiredQty: 10, actualQty: 10, unit: 'kg' },
      ],
      destinationBranchAllocations: [
        { branchId: 'b1', branchName: 'Al Olaya Flagship (Riyadh)', allocatedQty: 200, transferStatus: 'PENDING' },
        { branchId: 'b2', branchName: 'Jeddah Waterfront', allocatedQty: 100, transferStatus: 'PENDING' },
      ],
    },
  ];

  public getOrders(): ManufacturingOrder[] {
    return this.orders;
  }

  public createManufacturingOrder(order: Omit<ManufacturingOrder, 'id' | 'moNumber' | 'status'>): ManufacturingOrder {
    const mo: ManufacturingOrder = {
      ...order,
      id: `mo-${Date.now()}`,
      moNumber: `MO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PLANNED',
    };
    this.orders.unshift(mo);
    return mo;
  }

  public updateOrderStatus(orderId: string, status: ManufacturingOrder['status'], actualYield?: number): void {
    const mo = this.orders.find(o => o.id === orderId);
    if (mo) {
      mo.status = status;
      if (actualYield !== undefined) {
        mo.actualOutputYieldQty = actualYield;
        mo.wastePercentage = Number((((mo.targetOutputQty - actualYield) / mo.targetOutputQty) * 100).toFixed(2));
      }
    }
  }
}

export const globalCentralKitchen = new CentralKitchenEngine();
