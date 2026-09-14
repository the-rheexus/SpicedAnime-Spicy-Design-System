The application frame — fixed `Sidebar` + `TopBar` + scrolling content area. Compose every screen inside it.

```jsx
<AppShell
  active="batches" onNavigate={setView}
  sidebarProps={{ logoSrc:'assets/spicedanime-icon.png', operator:'Josiah' }}
  topBarProps={{ title:'Current Batches', breadcrumb:['Operations','Batches'], onSearch:()=>{},
    actions:<Button variant="primary" iconLeft={<Icon name="plus" size={15}/>}>New Batch</Button> }}
>
  …page content…
</AppShell>
```

Use `sidebar` / `topBar` props to drop in fully custom nodes. `contentMax` constrains content to 1440px. The shell is 100vh and handles its own scrolling.
