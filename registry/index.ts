export const registry = {
  name: "open-chat-front",
  type: "registry:ui",
  items: [
    {
      name: "chat-drawer",
      type: "registry:component",
      title: "Chat Drawer",
      description: "A reusable global drawer chat component with AI integration.",
      registryDependencies: ["drawer", "button", "input"],
      devDependencies: ["lucide-react"],
      files: [
        {
          path: "registry/new-york/chat-drawer/chat-drawer.tsx",
          type: "registry:component"
        }
      ]
    }
  ]
}
