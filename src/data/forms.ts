// The site's forms. Netlify Forms finds each one in the built HTML by its
// name and collects what's submitted (Netlify → Forms). A form used on more
// than one page (connect) must have the same fields everywhere, so pages pick
// a form by name here instead of writing their own markup.

export interface Field {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select';
  required?: boolean;
  autocomplete?: string;
  options?: string[];
}

export interface FormDef {
  /** Shown on the submit button. */
  submit: string;
  fields: Field[];
}

export const forms = {
  'plan-visit': {
    submit: "I'm Coming",
    fields: [
      { name: 'name', label: 'Name', required: true, autocomplete: 'name' },
      { name: 'contact', label: 'Email or phone', required: true, autocomplete: 'email' },
      { name: 'date', label: 'Which Sunday are you planning to come?', type: 'date' },
      { name: 'kids', label: "Kids' ages (optional)" },
    ],
  },
  connect: {
    submit: 'Connect With Me',
    fields: [
      { name: 'name', label: 'Name', required: true, autocomplete: 'name' },
      { name: 'contact', label: 'Email or phone', required: true, autocomplete: 'email' },
      {
        name: 'interest',
        label: "I'm interested in",
        type: 'select',
        options: ['Not sure yet', 'Meeting the pastor', 'Joining a group', 'Serving on a team', 'Membership'],
      },
      { name: 'message', label: 'Anything we should know? (optional)', type: 'textarea' },
    ],
  },
  prayer: {
    submit: 'Send Prayer Request',
    fields: [
      { name: 'name', label: 'Name (optional)', autocomplete: 'name' },
      { name: 'contact', label: 'Email or phone, if you want a reply (optional)', autocomplete: 'email' },
      { name: 'request', label: 'How can we pray for you?', type: 'textarea', required: true },
    ],
  },
  contact: {
    submit: 'Send Message',
    fields: [
      { name: 'name', label: 'Name', required: true, autocomplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
    ],
  },
} satisfies Record<string, FormDef>;

export type FormName = keyof typeof forms;
export const FORM_NAMES = Object.keys(forms) as [FormName, ...FormName[]];
