export const requestData = {
  title: "Song Request Form",
  description: "Submit your song requests for future performances or rehearsals",
  formFields: [
    {
      id: "name",
      label: "Your Name",
      type: "text",
      required: true,
      placeholder: "Enter your name"
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "Enter your email"
    },
    {
      id: "songTitle",
      label: "Song Title",
      type: "text",
      required: true,
      placeholder: "What song would you like to request?"
    },
    {
      id: "composer",
      label: "Composer/Artist",
      type: "text",
      required: false,
      placeholder: "Who wrote or performs this song?"
    },
    {
      id: "reason",
      label: "Reason for Request",
      type: "textarea",
      required: false,
      placeholder: "Why is this song meaningful to you?"
    }
  ],
  submitText: "Submit Request",
  recentRequests: [
    {
      songTitle: "The Prayer",
      requester: "Maria S.",
      date: "May 10, 2025"
    },
    {
      songTitle: "You Raise Me Up",
      requester: "John D.",
      date: "May 8, 2025"
    }
  ]
};