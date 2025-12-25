// Checklist item types
export type ChecklistItemAction = 
    | { type: 'internal'; label: string } // Navigate within app (Link)
    | { type: 'external'; label: string } // Open external link
    | { type: 'messaging'; platform: 'discord' | 'vrchat' | 'social' } // Special messaging actions
    | { type: 'poster' }; // Poster upload modal action

export type ChecklistItem = {
    label: string;
    completed: boolean;
    description: string;
    link: string;
    optional: boolean;
    action: ChecklistItemAction;
};
