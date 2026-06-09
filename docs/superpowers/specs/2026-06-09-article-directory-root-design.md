# Article Directory Root Fallback Design

## Decision

The admin article directory tree will not add a `Default` node. Articles that are not attached to any directory node will be automatically placed at the root of the article directory tree.

## Data Semantics

- `directory_node` stores real directory nodes only.
- `article_directory.node_id = 0` means the article is attached to the root directory.
- Articles without an `article_directory` row are considered unmounted.
- When the directory tree is queried, unmounted articles are assigned an `article_directory` row with `node_id = 0`.
- The system does not distinguish between an article manually moved to the root and an unmounted article automatically assigned to the root.

## Backend Behavior

- Keep the existing fallback behavior in `ArticleDirectoryServiceImpl.tree()`: before building the tree, ensure every article has an `article_directory` placement.
- Use `node_id = 0` as the fallback placement for unmounted articles.
- Preserve current move semantics: moving an article to the root updates its placement to `node_id = 0`.
- Do not add a system node, virtual node, or database migration for this feature.

## Admin UI Behavior

- The article directory tree continues to show the root directory as the top-level container.
- Root-level real directory nodes and root-level articles appear together under the root.
- Creating or assigning an article with parent `0` places it at the root.
- The existing "move to root" action remains the correct behavior for articles and directory nodes.
- No `Default` label, action, or node is added.

## Edge Cases

- If a new article is created outside the directory tree workflow, the next tree query will attach it to the root.
- If a placement references a deleted or missing article, it is ignored while rendering the tree.
- Historical `node_id = 0` placements remain root placements.

## Testing

- Verify the directory tree loads with unmounted articles visible at root.
- Verify creating a new article from the directory tree with parent root keeps it at root.
- Verify assigning an existing article to root keeps it at root.
- Verify moving an article from a directory to root keeps it visible at root.
- Verify no `Default` node appears in the admin tree.
