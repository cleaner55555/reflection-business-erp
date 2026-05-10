# Task 3 - dialog-converter

## Task
Convert Expenses module from Dialog to inline tabs

## Changes Made
1. **State**: Replaced `dialogOpen` with `activeTab` (values: 'pregled', 'dodaj', 'uredi')
2. **Handlers**: Updated handleCreate, handleEdit, handleSave to use activeTab
3. **JSX**: Restructured return with Tabs component containing 3 TabsContent:
   - **Pregled**: Filters + action buttons + expense table (original content)
   - **Dodaj**: Create expense form with inline save
   - **Uredi**: Expense list with edit/delete buttons; inline edit form when item selected
4. **Detail View**: Kept outside tabs, unchanged

## Files Modified
- `src/components/modules/Expenses/index.tsx` (ExpensesTab function, lines 571-1174)

## Notes
- Other tabs (ReportsTab, BudgetsTab, PoliciesTab, AnalyticsTab) still use `dialogOpen` - not in scope
- ESLint: 0 errors
- Pre-existing Forum module error unrelated to this change
