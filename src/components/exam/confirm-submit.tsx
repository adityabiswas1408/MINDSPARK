'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmSubmitProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called to close the dialog without submitting */
  onCancel: () => void;
  /** Called when student confirms submission */
  onConfirm: () => void;
  /** Number of answered questions */
  answeredCount: number;
  /** Total number of questions */
  totalCount: number;
  /** 1-based indices of unanswered questions */
  unansweredIndices?: number[];
}

/**
 * Submission confirmation dialog.
 *
 * Shows a warning if not all questions are answered.
 * Two-step: student must click "Submit Exam" to confirm.
 */
export function ConfirmSubmit({
  open,
  onCancel,
  onConfirm,
  answeredCount,
  totalCount,
  unansweredIndices = [],
}: ConfirmSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasUnanswered = answeredCount < totalCount;

  function handleConfirm() {
    setIsSubmitting(true);
    onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Submit Exam?</DialogTitle>
          <DialogDescription>
            {hasUnanswered
              ? `You have answered ${answeredCount} of ${totalCount} questions.`
              : `You have answered all ${totalCount} questions.`}
            {' '}This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {hasUnanswered && unansweredIndices.length > 0 && (
          <div
            style={{
              backgroundColor: '#FEF9C3',
              border: '1px solid #FDE047',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#713F12',
            }}
          >
            <span style={{ fontWeight: '600' }}>Unanswered: </span>
            {unansweredIndices.join(', ')}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Review Answers
          </Button>
          <Button
            data-testid="confirm-submit"
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#1A3829',
              color: '#FFFFFF',
            }}
          >
            {isSubmitting ? 'Submitting…' : 'Submit Final'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
