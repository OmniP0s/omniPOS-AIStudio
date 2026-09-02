import React, { useState, useEffect } from 'react';
import { posStore } from './services/posStateService';
import { HeaderNav, NavModule } from './components/layout/HeaderNav';
import { firstAllowedNav, hasAction } from './config/permissions';
import { POSLayout } from './components/pos/POSLayout';
import { TableFloorPlan } from './components/tables/TableFloorPlan';
import { KitchenDisplaySystem } from './components/kds/KitchenDisplaySystem';
import { ShiftDrawerManagement } from './components/shifts/ShiftDrawerManagement';
import { InventoryManager } from './components/inventory/InventoryManager';
import { AdvancedMenuEngine } from './components/menu/AdvancedMenuEngine';
import { CustomerPlatformView } from './components/customer/CustomerPlatformView';
import { HumanResourcesView } from './components/hr/HumanResourcesView';
import { AccountingLedgerView } from './components/accounting/AccountingLedgerView';
import { SecurityZeroTrustView } from './components/security/SecurityZeroTrustView';
import { CentralAdminPortal } from './components/admin/CentralAdminPortal';
import { TestSuiteRunner } from './components/tests/TestSuiteRunner';
import { QualityEngineeringCenter } from './components/quality/QualityEngineeringCenter';
import { ZatcaComplianceView } from './components/zatca/ZatcaComplianceView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { HardwareManager } from './components/hardware/HardwareManager';
import { SettingsView } from './components/settings/SettingsView';
import { UserManagementView } from './components/admin/UserManagementView';
import { ProcurementView } from './components/procurement/ProcurementView';
import { CentralKitchenView } from './components/kitchen/CentralKitchenView';
import { DeliveryFleetView } from './components/delivery/DeliveryFleetView';
import { FranchiseManagementView } from './components/franchise/FranchiseManagementView';
import { EnterpriseWorkflowView } from './components/workflow/EnterpriseWorkflowView';
import { AiPredictiveServicesView } from './components/ai/AiPredictiveServicesView';
import { IntegrationPlatformView } from './components/integrations/IntegrationPlatformView';
import { SaaSBillingView } from './components/saas/SaaSBillingView';
import { DisasterRecoveryView } from './components/dr/DisasterRecoveryView';
import { EnterpriseProductionCenter } from './components/production/EnterpriseProductionCenter';
import { Sprint1FoundationCenter } from './components/foundation/Sprint1FoundationCenter';
import { RuntimeOpsCenter } from './components/runtime/RuntimeOpsCenter';
import { AiFoundationCenter } from './components/ai/AiFoundationCenter';
import { AiEnterpriseApplicationsCenter } from './components/ai/AiEnterpriseApplicationsCenter';
import { AiAutonomousAgentsCenter } from './components/ai/AiAutonomousAgentsCenter';
import { AiCognitiveMultimodalCenter } from './components/ai/AiCognitiveMultimodalCenter';
import { EnterpriseSaaSPlatformCenter } from './components/saas/EnterpriseSaaSPlatformCenter';
import { DiningTable, Order, OrderItem, Branch } from './types';
import { LoginScreen } from './components/auth/LoginScreen';

export default function App() {
  const [storeState, setStoreState] = useState(() => posStore.getState());
  const [activeModule, setActiveModule] = useState<NavModule>('POS');
  const [isArabic, setIsArabic] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Subscribe to posStore changes
  useEffect(() => {
    const unsub = posStore.subscribe(newState => {
      setStoreState({ ...newState });
    });
    return () => unsub();
  }, []);

  // Update HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
  }, [isArabic]);

  // Update Dark Mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const activeBranch =
    storeState.tenant.branches.find(b => b.id === storeState.currentBranchId) ||
    storeState.tenant.branches[0];

  const handleSelectTableAndSwitchToPOS = (table: DiningTable) => {
    posStore.updateTableStatus(table.id, 'OCCUPIED');
    setActiveModule('POS');
  };

  const handleSaveOrder = (order: Order) => {
    posStore.saveOrder(order);
  };

  const handleProcessPayment = async (
    orderId: string,
    method: any,
    tenderedAmount: number,
    tipAmount: number,
    cardLast4?: string,
    isB2B?: boolean,
    buyerDetails?: { name: string; vat: string }
  ) => {
    return await posStore.processPayment(
      orderId,
      method,
      tenderedAmount,
      tipAmount,
      cardLast4,
      isB2B,
      buyerDetails
    );
  };

  const handleUpdateItemStatus = (
    orderId: string,
    itemId: string,
    status: OrderItem['status']
  ) => {
    posStore.updateItemKitchenStatus(orderId, itemId, status);
  };

  const handleCompleteOrder = (order: Order) => {
    posStore.saveOrder({
      ...order,
      status: 'COMPLETED',
    });
  };

  const handleAddShiftAdjustment = (
    type: 'PAY_IN' | 'PAY_OUT' | 'DROP',
    amount: number,
    reason: string
  ) => {
    posStore.addDrawerAdjustment(type, amount, reason);
  };

  const handleCloseShift = (actualCash: number) => {
    posStore.closeShift(actualCash);
  };

  const handleAdjustStock = (
    itemId: string,
    warehouseId: string,
    newQty: number,
    reason: string
  ) => {
    posStore.adjustInventory(itemId, warehouseId, newQty, reason);
  };

  const handleSelectBranch = (branch: Branch) => {
    posStore.setBranch(branch.id);
  };

  const currency = storeState.tenant.currency || 'SAR';

  if (!isLoggedIn) {
    return (
      <LoginScreen
        isArabic={isArabic}
        onLogin={user => {
          posStore.setActiveUser(user);
          setActiveModule(firstAllowedNav(user.role) as NavModule);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Global Application Header & Module Navigation */}
      <HeaderNav
        tenant={storeState.tenant}
        activeModule={activeModule}
        activeBranch={activeBranch}
        activeUser={storeState.activeUser}
        isArabic={isArabic}
        darkMode={darkMode}
        onSelectModule={setActiveModule}
        onSelectBranch={handleSelectBranch}
        onToggleLanguage={() => setIsArabic(!isArabic)}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Active Module Screen */}
      <main className="flex-1 flex overflow-hidden">
        {activeModule === 'SAAS_PLATFORM' && (
          <EnterpriseSaaSPlatformCenter isArabic={isArabic} />
        )}

        {activeModule === 'COGNITIVE_AI' && (
          <AiCognitiveMultimodalCenter isArabic={isArabic} />
        )}

        {activeModule === 'AI_AGENTS' && (
          <AiAutonomousAgentsCenter isArabic={isArabic} />
        )}

        {activeModule === 'AI_APPS' && (
          <AiEnterpriseApplicationsCenter />
        )}

        {activeModule === 'AI_FOUNDATION' && (
          <AiFoundationCenter isArabic={isArabic} />
        )}

        {activeModule === 'SPRINT1_FOUNDATION' && (
          <Sprint1FoundationCenter isArabic={isArabic} />
        )}

        {activeModule === 'RUNTIME_OPS' && (
          <RuntimeOpsCenter isArabic={isArabic} />
        )}

        {activeModule === 'POS' && (
          <POSLayout
            tenant={storeState.tenant}
            categories={storeState.categories}
            menuItems={storeState.menuItems}
            modifierGroups={storeState.modifierGroups}
            tables={storeState.tables}
            customers={storeState.customers}
            activeOrder={storeState.activeOrder}
            currency={currency}
            isArabic={isArabic}
            canApplyDiscount={hasAction(storeState.activeUser.role, 'canApplyDiscount')}
            onSaveOrder={handleSaveOrder}
            onProcessPayment={handleProcessPayment}
            onSelectTable={handleSelectTableAndSwitchToPOS}
          />
        )}

        {activeModule === 'FLOOR_PLAN' && (
          <TableFloorPlan
            tables={storeState.tables}
            reservations={storeState.reservations}
            orders={storeState.orders}
            currency={currency}
            isArabic={isArabic}
            onSelectTable={handleSelectTableAndSwitchToPOS}
            onUpdateTableStatus={(tblId, status) => posStore.updateTableStatus(tblId, status)}
          />
        )}

        {activeModule === 'KDS' && (
          <KitchenDisplaySystem
            orders={storeState.orders}
            stations={storeState.stations}
            isArabic={isArabic}
            onUpdateItemStatus={handleUpdateItemStatus}
            onCompleteOrder={handleCompleteOrder}
          />
        )}

        {activeModule === 'SHIFTS' && (
          <ShiftDrawerManagement
            shift={storeState.currentShift}
            tenant={storeState.tenant}
            currency={currency}
            isArabic={isArabic}
            onAddAdjustment={handleAddShiftAdjustment}
            onCloseShift={handleCloseShift}
          />
        )}

        {activeModule === 'MENU' && (
          <AdvancedMenuEngine
            menuItems={storeState.menuItems}
            categories={storeState.categories}
            inventoryItems={storeState.inventory}
            isArabic={isArabic}
            onUpdateItemAvailability={(itemId, isAvailable) => {
              const item = storeState.menuItems.find(m => m.id === itemId);
              if (item) {
                item.isAvailable = isAvailable;
                posStore.persist();
              }
            }}
          />
        )}

        {activeModule === 'INVENTORY' && (
          <InventoryManager
            inventory={storeState.inventory}
            warehouses={storeState.warehouses}
            menuItems={storeState.menuItems}
            currency={currency}
            isArabic={isArabic}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {activeModule === 'PROCUREMENT' && (
          <ProcurementView isArabic={isArabic} />
        )}

        {activeModule === 'CENTRAL_KITCHEN' && (
          <CentralKitchenView isArabic={isArabic} />
        )}

        {activeModule === 'DELIVERY' && (
          <DeliveryFleetView isArabic={isArabic} />
        )}

        {activeModule === 'CUSTOMERS' && (
          <CustomerPlatformView
            customers={storeState.customers}
            giftCards={storeState.giftCards}
            isArabic={isArabic}
          />
        )}

        {activeModule === 'FRANCHISE' && (
          <FranchiseManagementView isArabic={isArabic} />
        )}

        {activeModule === 'HR' && (
          <HumanResourcesView
            isArabic={isArabic}
            activeUser={storeState.activeUser}
          />
        )}

        {activeModule === 'ACCOUNTING' && (
          <AccountingLedgerView
            isArabic={isArabic}
            activeUser={storeState.activeUser}
          />
        )}

        {activeModule === 'WORKFLOW' && (
          <EnterpriseWorkflowView isArabic={isArabic} />
        )}

        {activeModule === 'AI_SERVICES' && (
          <AiPredictiveServicesView isArabic={isArabic} />
        )}

        {activeModule === 'INTEGRATIONS' && (
          <IntegrationPlatformView isArabic={isArabic} />
        )}

        {activeModule === 'SAAS_BILLING' && (
          <SaaSBillingView isArabic={isArabic} />
        )}

        {activeModule === 'DISASTER_RECOVERY' && (
          <DisasterRecoveryView isArabic={isArabic} />
        )}

        {activeModule === 'PRODUCTION' && (
          <EnterpriseProductionCenter isArabic={isArabic} />
        )}

        {activeModule === 'ZATCA' && (
          <ZatcaComplianceView
            tenant={storeState.tenant}
            orders={storeState.orders}
            isArabic={isArabic}
          />
        )}

        {activeModule === 'ANALYTICS' && (
          <AnalyticsDashboard
            tenant={storeState.tenant}
            orders={storeState.orders}
            currency={currency}
            isArabic={isArabic}
          />
        )}

        {activeModule === 'SECURITY' && (
          <SecurityZeroTrustView
            auditLogs={storeState.auditLogs}
            isArabic={isArabic}
            activeUser={storeState.activeUser}
          />
        )}

        {activeModule === 'ADMIN' && (
          <CentralAdminPortal
            tenant={storeState.tenant}
            activeBranch={activeBranch}
            activeUser={storeState.activeUser}
            isArabic={isArabic}
            onUpdateTenant={t => {
              Object.assign(storeState.tenant, t);
              posStore.persist();
            }}
          />
        )}

        {activeModule === 'TESTS' && (
          <QualityEngineeringCenter isArabic={isArabic} />
        )}

        {activeModule === 'HARDWARE' && (
          <HardwareManager
            devices={storeState.devices}
            isArabic={isArabic}
            onUpdateDeviceStatus={(devId, isOnline) => {
              // Toggle online state
            }}
          />
        )}

        {activeModule === 'SETTINGS' && (
          <SettingsView
            tenant={storeState.tenant}
            isArabic={isArabic}
            onUpdateTenant={t => {}}
            onToggleLanguage={() => setIsArabic(!isArabic)}
          />
        )}
        {activeModule === 'USER_MANAGEMENT' && (
          <UserManagementView
            isArabic={isArabic}
            activeUser={storeState.activeUser}
          />
        )}
      </main>
    </div>
  );
}
