import React, { useState } from 'react';
import { MenuItem, ModifierGroup, SelectedModifier } from '../../types';
import { X, Plus, Minus, Check, Scale } from 'lucide-react';

interface ProductModifierModalProps {
  item: MenuItem;
  modifierGroups: ModifierGroup[];
  currency: string;
  isArabic: boolean;
  scaleWeightKg?: number;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedModifiers: SelectedModifier[], quantity: number, instructions: string, unitPrice: number) => void;
}

export const ProductModifierModal: React.FC<ProductModifierModalProps> = ({
  item,
  modifierGroups,
  currency,
  isArabic,
  scaleWeightKg,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [selectedMods, setSelectedMods] = useState<Record<string, string[]>>(() => {
    // Preselect defaults
    const initial: Record<string, string[]> = {};
    const relevantGroups = modifierGroups.filter(g => item.modifierGroupIds.includes(g.id));
    relevantGroups.forEach(group => {
      const defaultOpt = group.options.find(o => o.isDefault) || (group.isMandatory ? group.options[0] : null);
      if (defaultOpt) {
        initial[group.id] = [defaultOpt.id];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });

  const relevantGroups = modifierGroups.filter(g => item.modifierGroupIds.includes(g.id));

  const handleToggleOption = (group: ModifierGroup, optionId: string) => {
    const current = selectedMods[group.id] || [];
    if (group.maxSelect === 1) {
      setSelectedMods({ ...selectedMods, [group.id]: [optionId] });
    } else {
      if (current.includes(optionId)) {
        setSelectedMods({ ...selectedMods, [group.id]: current.filter(id => id !== optionId) });
      } else {
        if (current.length < group.maxSelect) {
          setSelectedMods({ ...selectedMods, [group.id]: [...current, optionId] });
        }
      }
    }
  };

  // Calculate dynamic price
  let basePrice = item.price;
  if (item.weighable && scaleWeightKg) {
    basePrice = Number((item.price * scaleWeightKg).toFixed(2));
  }

  let extraModifiersPrice = 0;
  const flatSelectedList: SelectedModifier[] = [];

  relevantGroups.forEach(group => {
    const chosenIds = selectedMods[group.id] || [];
    chosenIds.forEach(optId => {
      const opt = group.options.find(o => o.id === optId);
      if (opt) {
        extraModifiersPrice += opt.price;
        flatSelectedList.push({
          groupId: group.id,
          groupName: isArabic ? group.nameAr : group.nameEn,
          optionId: opt.id,
          optionName: isArabic ? opt.nameAr : opt.nameEn,
          price: opt.price,
        });
      }
    });
  });

  const unitTotal = basePrice + extraModifiersPrice;
  const lineTotal = unitTotal * quantity;

  // Validation: Check mandatory groups
  const isValid = relevantGroups.every(g => {
    if (!g.isMandatory) return true;
    const count = (selectedMods[g.id] || []).length;
    return count >= g.minSelect;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-100 dark:bg-slate-800 shrink-0">
          <img
            src={item.image}
            alt={item.nameEn}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-5">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {item.sku}
                </span>
                {item.weighable && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    {isArabic ? `موزون (${scaleWeightKg || 1} كجم)` : `Weighed (${scaleWeightKg || 1} kg)`}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {isArabic ? item.nameAr : item.nameEn}
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm line-clamp-1 mt-0.5">
                {isArabic ? item.descriptionAr : item.descriptionEn}
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modifiers List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
          {relevantGroups.map(group => {
            const chosen = selectedMods[group.id] || [];
            return (
              <div key={group.id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                      {isArabic ? group.nameAr : group.nameEn}
                      {group.isMandatory && (
                        <span className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-medium px-2 py-0.5 rounded">
                          {isArabic ? 'إلزامي' : 'Required'}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {group.maxSelect === 1
                        ? isArabic ? 'اختر خياراً واحداً' : 'Select 1 option'
                        : isArabic ? `اختر حتى ${group.maxSelect} خيارات` : `Select up to ${group.maxSelect} options`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.options.map(option => {
                    const isSelected = chosen.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleToggleOption(group, option.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-${group.maxSelect === 1 ? 'full' : 'md'} border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-medium">
                            {isArabic ? option.nameAr : option.nameEn}
                          </span>
                        </div>
                        {option.price > 0 && (
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            +{option.price.toFixed(2)} {currency}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special Instructions */}
          <div className="pt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {isArabic ? 'ملاحظات خاصة للمطبخ' : 'Special Kitchen Instructions'}
            </label>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder={isArabic ? 'مثال: بدون بصل، صلصة خارجية، تسوية خاصة...' : 'e.g. No onion, dressing on the side, well grilled...'}
              rows={2}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-bold text-slate-900 dark:text-white text-base">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            disabled={!isValid}
            onClick={() => {
              onAddToCart(item, flatSelectedList, quantity, instructions, unitTotal);
              onClose();
            }}
            className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-sm sm:text-base flex items-center justify-between shadow-lg shadow-indigo-500/25 transition-all"
          >
            <span>{isArabic ? 'إضافة إلى الطلب' : 'Add to Order'}</span>
            <span className="bg-indigo-700/60 px-3 py-1 rounded-lg">
              {lineTotal.toFixed(2)} {currency}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
