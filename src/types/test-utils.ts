import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeDisabled(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeHidden(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, any>): R;
      toBeEmpty(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toHaveFocus(): R;
      toBeRequired(): R;
      toBeOptional(): R;
      toHaveValue(value?: string | string[] | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveDescription(text: string | RegExp): R;
      toBeAriaInvalid(): R;
      toBeAriaRequired(): R;
      toBeAriaDescribedBy(id: string): R;
      toBeAriaLabeledBy(id: string): R;
      toBeAriaExpanded(expanded: boolean): R;
      toBeAriaPressed(pressed: boolean): R;
      toBeAriaSelected(selected: boolean): R;
      toBeAriaChecked(checked: boolean): R;
      toBeAriaBusy(busy: boolean): R;
      toBeAriaLive(polite: 'off' | 'polite' | 'assertive'): R;
      toBeAriaRelevant(relevant: 'additions' | 'removals' | 'text' | 'all'): R;
      toBeAriaAtomic(atomic: boolean): R;
      toBeAriaDropeffect(effect: string): R;
      toBeAriaGrabbed(grabbed: boolean): R;
      toBeAriaHaspopup(popup: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'): R;
      toBeAriaLevel(level: number): R;
      toBeAriaMultiline(multiline: boolean): R;
      toBeAriaMultiselectable(multiselectable: boolean): R;
      toBeAriaOrientation(orientation: 'horizontal' | 'vertical' | undefined): R;
      toBeAriaReadonly(readonly: boolean): R;
      toBeAriaRequired(required: boolean): R;
      toBeAriaSort(sort: 'ascending' | 'descending' | 'none' | 'other'): R;
      toBeAriaValuemax(max: number): R;
      toBeAriaValuemin(min: number): R;
      toBeAriaValuenow(now: number): R;
      toBeAriaValuetext(text: string): R;
    }
  }
}
