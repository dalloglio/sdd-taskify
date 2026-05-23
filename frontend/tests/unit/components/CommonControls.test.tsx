import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Button from '../../../src/components/Button';
import Input from '../../../src/components/Input';
import Modal from '../../../src/components/Modal';
import { renderWithProviders } from '../../utils';

describe('common controls', () => {
  it('renders a button that forwards native button props', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Button onClick={onClick}>Save changes</Button>);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an accessible input', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <label>
        Project name
        <Input name="name" />
      </label>
    );
    await user.type(screen.getByLabelText(/project name/i), 'Website Refresh');

    expect(screen.getByLabelText(/project name/i)).toHaveValue('Website Refresh');
  });

  it('hides and closes modal content by state', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    const { rerender } = renderWithProviders(
      <Modal open={false} onClose={onClose}>
        Hidden body
      </Modal>
    );
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument();

    rerender(
      <Modal open onClose={onClose}>
        Visible body
      </Modal>
    );
    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.getByText('Visible body')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
