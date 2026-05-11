import { render } from '@testing-library/react';
import React from 'react';

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui);
}

export default renderWithProviders;
