# Raycast Extension Developer

Expert guidance for building Raycast extensions with TypeScript and React.

## Triggers

- Building or modifying Raycast extensions
- Questions about Raycast API components
- Implementing List, Grid, Form, or Detail views
- Using @raycast/utils hooks
- Extension publishing and best practices

## Commands

```bash
npm run dev        # Start development (ray develop)
npm run build      # Build extension (ray build)
npm run lint       # Run ESLint
```

## Project Structure

```
extension/
├── src/
│   └── index.tsx      # Main command entry point
├── package.json       # Extension manifest + dependencies
├── tsconfig.json      # TypeScript config
└── assets/            # Icons and images
```

## Core Components

### List (most common)

```tsx
import { List, ActionPanel, Action } from "@raycast/api";

export default function Command() {
  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Item Title"
        subtitle="Secondary text"
        icon={Icon.Star}
        accessories={[{ text: "hint" }]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser url="https://example.com" />
            <Action.CopyToClipboard content="text" />
          </ActionPanel>
        }
      />
    </List>
  );
}
```

**Key Props:**
- `isLoading` - show loading indicator
- `filtering` - set `false` for custom filtering
- `searchBarPlaceholder` - hint text
- `onSearchTextChange` - custom search handling
- `isShowingDetail` - enable detail panel

**Subcomponents:**
- `List.Section` - group items with title
- `List.Item.Detail` - right panel with markdown/metadata
- `List.Dropdown` - filter accessory (⌘P to open)
- `List.EmptyView` - shown when no items

### Grid

```tsx
import { Grid } from "@raycast/api";

export default function Command() {
  return (
    <Grid columns={4} aspectRatio="3/2">
      <Grid.Item content="image.png" title="Title" />
    </Grid>
  );
}
```

**Key Props:**
- `columns` - 1-8 columns
- `aspectRatio` - "1", "3/2", "16/9", etc.
- `fit` - `Grid.Fit.Contain` or `Grid.Fit.Fill`
- `inset` - spacing: Small, Medium, Large

### Detail

```tsx
import { Detail } from "@raycast/api";

export default function Command() {
  return (
    <Detail
      markdown="# Hello\n\nContent here"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Status" text="Active" />
          <Detail.Metadata.Link title="URL" target="https://example.com" text="Link" />
          <Detail.Metadata.TagList title="Tags">
            <Detail.Metadata.TagList.Item text="Tag1" color={Color.Green} />
          </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
    />
  );
}
```

### Form

```tsx
import { Form, Action, ActionPanel } from "@raycast/api";

export default function Command() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={(values) => console.log(values)} />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Name" placeholder="Enter name" />
      <Form.Dropdown id="type" title="Type">
        <Form.Dropdown.Item value="a" title="Option A" />
        <Form.Dropdown.Item value="b" title="Option B" />
      </Form.Dropdown>
      <Form.Checkbox id="enabled" label="Enable feature" />
      <Form.DatePicker id="date" title="Date" />
      <Form.TextArea id="notes" title="Notes" enableMarkdown />
    </Form>
  );
}
```

**Validation Pattern:**
```tsx
const [error, setError] = useState<string>();

<Form.TextField
  id="email"
  error={error}
  onChange={() => setError(undefined)}
  onBlur={(e) => {
    if (!e.target.value?.includes("@")) {
      setError("Invalid email");
    }
  }}
/>
```

## ActionPanel

```tsx
<ActionPanel>
  {/* First action = ↵, second = ⌘↵ */}
  <Action.OpenInBrowser url="https://example.com" />
  <Action.CopyToClipboard content="text" />

  <ActionPanel.Section title="Other">
    <Action title="Custom" onAction={() => {}} shortcut={{ modifiers: ["cmd"], key: "d" }} />
  </ActionPanel.Section>

  <ActionPanel.Submenu title="More Options">
    <Action title="Option 1" onAction={() => {}} />
  </ActionPanel.Submenu>
</ActionPanel>
```

**Built-in Actions:**
- `Action.OpenInBrowser` - open URL
- `Action.CopyToClipboard` - copy text
- `Action.Paste` - paste to frontmost app
- `Action.Push` - navigate to component
- `Action.Pop` - go back
- `Action.SubmitForm` - submit form
- `Action.ShowInFinder` - reveal file
- `Action.Trash` - move to trash
- `Action.Open` - open with default app

## React Hooks (@raycast/utils)

### usePromise

```tsx
import { usePromise } from "@raycast/utils";

const { data, isLoading, error, revalidate } = usePromise(
  async (query: string) => {
    const res = await fetch(`/api?q=${query}`);
    return res.json();
  },
  [searchText],
  { execute: searchText.length > 0 }
);
```

### useFetch

```tsx
import { useFetch } from "@raycast/utils";

const { data, isLoading, revalidate } = useFetch<ApiResponse>(
  `https://api.example.com/items?q=${searchText}`,
  {
    keepPreviousData: true,
    execute: searchText.length > 0,
  }
);
```

### useCachedState

```tsx
import { useCachedState } from "@raycast/utils";

const [items, setItems] = useCachedState<Item[]>("items", []);
```

### useForm

```tsx
import { useForm } from "@raycast/utils";

const { handleSubmit, itemProps } = useForm<FormValues>({
  onSubmit: (values) => console.log(values),
  validation: {
    name: (value) => (!value ? "Required" : undefined),
  },
});

<Form.TextField {...itemProps.name} />
```

## Feedback

### Toast

```tsx
import { showToast, Toast } from "@raycast/api";

// Success
await showToast({ style: Toast.Style.Success, title: "Done" });

// Error
await showToast({ style: Toast.Style.Failure, title: "Error", message: "Details" });

// Loading (can update)
const toast = await showToast({ style: Toast.Style.Animated, title: "Loading..." });
toast.style = Toast.Style.Success;
toast.title = "Complete";
```

### HUD

```tsx
import { showHUD } from "@raycast/api";

await showHUD("Copied!"); // Brief overlay, doesn't interrupt
```

### Alert

```tsx
import { confirmAlert, Alert } from "@raycast/api";

const confirmed = await confirmAlert({
  title: "Delete item?",
  message: "This cannot be undone",
  primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
});
```

## Storage

```tsx
import { LocalStorage } from "@raycast/api";

await LocalStorage.setItem("key", "value");
const value = await LocalStorage.getItem<string>("key");
await LocalStorage.removeItem("key");
await LocalStorage.clear();
```

**Note:** For large data, use Node.js file APIs with the support directory.

## Utilities

```tsx
import {
  open,
  showInFinder,
  trash,
  getApplications,
  getFrontmostApplication,
  popToRoot,
  closeMainWindow,
} from "@raycast/api";

await open("https://example.com");
await open("/path/to/file");
await showInFinder("/path/to/file");
await trash("/path/to/file");
await popToRoot(); // Return to root search
await closeMainWindow(); // Close Raycast
```

## Best Practices

### Error Handling
- Handle expected errors gracefully with Toast
- Show cached data when network fails
- Use `try/catch` with informative messages

```tsx
try {
  const data = await fetchData();
} catch (error) {
  await showToast({
    style: Toast.Style.Failure,
    title: "Failed to load",
    message: error instanceof Error ? error.message : "Unknown error",
  });
}
```

### Performance
- Render components quickly, load data async
- Always use `isLoading` prop during data fetch
- Use `keepPreviousData` to prevent flickering
- Use `throttle` for search with async operations

### Dependencies
- Check external app availability before use
- Hide features requiring missing dependencies
- Show helpful installation messages

### Forms
- Validate on blur, clear errors on change
- Use `useForm` hook for consistent behavior
- Enable `enableDrafts` for long forms

## package.json Manifest

```json
{
  "name": "extension-name",
  "title": "Extension Title",
  "description": "What it does",
  "icon": "icon.png",
  "author": "username",
  "categories": ["Productivity"],
  "license": "MIT",
  "commands": [
    {
      "name": "index",
      "title": "Command Title",
      "description": "What this command does",
      "mode": "view"
    }
  ],
  "dependencies": {
    "@raycast/api": "^1.0.0",
    "@raycast/utils": "^1.0.0"
  }
}
```

**Command modes:**
- `view` - renders React component
- `no-view` - background script (use Toast for feedback)
- `menu-bar` - menu bar extra

## Reference

- [Raycast API Docs](https://developers.raycast.com)
- [Extension Examples](https://github.com/raycast/extensions)
