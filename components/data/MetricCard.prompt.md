KPI tile for the dashboard header row. Big mono number, uppercase label, optional trend delta and icon.

```jsx
<MetricCard label="Open batches" value="12" icon="layers" accent />
<MetricCard label="Units in production" value="1,284" unit="units" delta="+8%" trend="up" />
<MetricCard label="Blocked items" value="3" icon="octagon-x" delta="needs review" trend="down" />
```

`accent` adds the spice left-rule for the single hero metric. `trend` colors the delta (up=green, down=red, flat=grey).
