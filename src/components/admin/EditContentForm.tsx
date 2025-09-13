import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

import EditNewsForm from './EditNewsForm';
import EditEventForm from './EditEventForm';
import EditResourceForm from './EditResourceForm';
import EditPageForm from './EditPageForm';

interface EditContentFormProps {
  contentItem: any; // The content item to be edited (can be News, Event, Resource, Page)
  onSuccess: () => void; // Callback on successful update
  onCancel: () => void; // Callback on cancel
}

const EditContentForm = ({ contentItem, onSuccess, onCancel }: EditContentFormProps) => {
  if (!contentItem) {
    return (
      <div className="p-4 text-center">
        <p>No content item selected for editing.</p>
        <Button onClick={onCancel} className="mt-4">Close</Button>
      </div>
    );
  }

  const renderForm = () => {
    switch (contentItem.type) {
      case 'News':
        return <EditNewsForm contentItem={contentItem} onSuccess={onSuccess} onCancel={onCancel} />;
      case 'Event':
        return <EditEventForm contentItem={contentItem} onSuccess={onSuccess} onCancel={onCancel} />;
      case 'Resource':
        return <EditResourceForm contentItem={contentItem} onSuccess={onSuccess} onCancel={onCancel} />;
      case 'Page':
        return <EditPageForm contentItem={contentItem} onSuccess={onSuccess} onCancel={onCancel} />;
      default:
        return (
          <div className="p-4 text-center">
            <p>Unknown content type: {contentItem.type}</p>
            <Button onClick={onCancel} className="mt-4">Close</Button>
          </div>
        );
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit {contentItem.type}</DialogTitle>
        <DialogDescription>
          Make changes to your {contentItem.type.toLowerCase()} here.
        </DialogDescription>
      </DialogHeader>
      {renderForm()}
    </div>
  );
};

export default EditContentForm;