# Article Directory Root Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure articles without a directory placement appear under the root directory, without adding a `Default` node.

**Architecture:** The backend keeps `article_directory.node_id = 0` as the root placement and adds missing placements before building the tree. The admin UI renders the existing synthetic `rootItem` as the top tree container so root-level articles and nodes appear under a visible "根目录" node.

**Tech Stack:** Spring Boot 3.4, MyBatis-Plus, JUnit 5, Mockito, React 18, TypeScript, Ant Design Tree.

---

### Task 1: Backend Root Fallback Regression Test

**Files:**
- Create: `blog-service/src/test/java/com/blog/modules/article/service/impl/ArticleDirectoryServiceImplTest.java`
- Verify: `blog-service/src/main/java/com/blog/modules/article/service/impl/ArticleDirectoryServiceImpl.java`

- [ ] **Step 1: Add a regression test for unmounted articles**

Create `blog-service/src/test/java/com/blog/modules/article/service/impl/ArticleDirectoryServiceImplTest.java`:

```java
package com.blog.modules.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.blog.modules.article.mapper.ArticleDirectoryMapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.DirectoryNodeMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.entity.ArticleDirectory;
import com.blog.modules.article.model.vo.ArticleDirectoryItemVO;
import com.blog.modules.article.service.ArticleCommandService;
import com.blog.modules.category.mapper.CategoryMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ArticleDirectoryServiceImplTest {

    private DirectoryNodeMapper nodeMapper;
    private ArticleDirectoryMapper directoryArticleMapper;
    private ArticleMapper articleMapper;
    private CategoryMapper categoryMapper;
    private ArticleDirectoryServiceImpl service;

    @BeforeEach
    void setUp() {
        nodeMapper = mock(DirectoryNodeMapper.class);
        directoryArticleMapper = mock(ArticleDirectoryMapper.class);
        articleMapper = mock(ArticleMapper.class);
        categoryMapper = mock(CategoryMapper.class);

        service = new ArticleDirectoryServiceImpl();
        ReflectionTestUtils.setField(service, "nodeMapper", nodeMapper);
        ReflectionTestUtils.setField(service, "directoryArticleMapper", directoryArticleMapper);
        ReflectionTestUtils.setField(service, "articleMapper", articleMapper);
        ReflectionTestUtils.setField(service, "categoryMapper", categoryMapper);
        ReflectionTestUtils.setField(service, "articleCommandService", mock(ArticleCommandService.class));
    }

    @Test
    void tree_attachesArticlesWithoutDirectoryPlacementToRoot() {
        Article article = new Article();
        article.setId(10L);
        article.setTitle("Unassigned article");

        ArgumentCaptor<ArticleDirectory> placementCaptor = ArgumentCaptor.forClass(ArticleDirectory.class);

        when(articleMapper.selectList(any(Wrapper.class))).thenReturn(List.of(article));
        when(directoryArticleMapper.selectList(any(Wrapper.class)))
                .thenReturn(List.of())
                .thenReturn(List.of(rootPlacement(10L)));
        when(directoryArticleMapper.selectMaxSortByNodeId(0L)).thenReturn(0);
        when(nodeMapper.selectMaxSortByParentId(0L)).thenReturn(0);
        when(nodeMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(articleMapper.selectBatchIds(List.of(10L))).thenReturn(List.of(article));

        List<ArticleDirectoryItemVO> tree = service.tree();

        org.mockito.Mockito.verify(directoryArticleMapper).insert(placementCaptor.capture());
        ArticleDirectory inserted = placementCaptor.getValue();
        assertThat(inserted.getArticleId()).isEqualTo(10L);
        assertThat(inserted.getNodeId()).isZero();
        assertThat(inserted.getSort()).isEqualTo(10);

        assertThat(tree).hasSize(1);
        ArticleDirectoryItemVO rootArticle = tree.get(0);
        assertThat(rootArticle.getType()).isEqualTo("ARTICLE");
        assertThat(rootArticle.getArticleId()).isEqualTo(10L);
        assertThat(rootArticle.getParentId()).isZero();
        assertThat(rootArticle.getTitle()).isEqualTo("Unassigned article");
    }

    private static ArticleDirectory rootPlacement(Long articleId) {
        ArticleDirectory placement = new ArticleDirectory();
        placement.setId(1L);
        placement.setArticleId(articleId);
        placement.setNodeId(0L);
        placement.setSort(10);
        return placement;
    }
}
```

- [ ] **Step 2: Run the backend test**

Run:

```bash
cd blog-service
./gradlew test --tests com.blog.modules.article.service.impl.ArticleDirectoryServiceImplTest
```

Expected: The test passes because the current backend already implements the root fallback behavior.

- [ ] **Step 3: Commit the backend test**

Run:

```bash
git add blog-service/src/test/java/com/blog/modules/article/service/impl/ArticleDirectoryServiceImplTest.java
git commit -m "test: cover article directory root fallback"
```

### Task 2: Render Root Directory As The Top Tree Container

**Files:**
- Modify: `blog-admin/src/pages/Article/DirectoryTree.tsx`

- [ ] **Step 1: Render the existing synthetic root node**

Change the tree data memo in `blog-admin/src/pages/Article/DirectoryTree.tsx` from:

```tsx
const treeData = useMemo(() => buildTreeData(items), [items, filteredKeys, totalCounts, searchText])
```

to:

```tsx
const treeData = useMemo(() => buildTreeData([rootItem]), [rootItem, filteredKeys, totalCounts, searchText])
```

- [ ] **Step 2: Expand the root node after loading**

Change the successful load branch from:

```tsx
setExpandedKeys(collectNodeKeys(data))
```

to:

```tsx
setExpandedKeys(['root', ...collectNodeKeys(data)])
```

- [ ] **Step 3: Include root as the ancestor during search**

Change:

```tsx
rootItem.children?.forEach((child) => indexAncestors(child, null))
```

to:

```tsx
indexAncestors(rootItem, null)
```

- [ ] **Step 4: Only allow dropping inside root**

Change the root allow-drop branch from:

```tsx
if (target.type === 'ROOT') return true
```

to:

```tsx
if (target.type === 'ROOT') return dropPosition === 0
```

- [ ] **Step 5: Treat every root drop as an inside-root move**

Change the root target branch in `handleDrop` from:

```tsx
if (targetItem.type === 'ROOT') {
  if (info.dropToGap) {
    const rootChildren = rootItem.children || []
    if (rootChildren.length === 0) {
      position = 'INSIDE'
    } else {
      position = info.dropPosition <= 0 ? 'BEFORE' : 'AFTER'
    }
  } else {
    position = 'INSIDE'
  }
}
```

to:

```tsx
if (targetItem.type === 'ROOT') {
  position = 'INSIDE'
}
```

- [ ] **Step 6: Run frontend verification**

Run:

```bash
cd blog-admin
pnpm build
```

Expected: TypeScript and Vite build complete without errors.

- [ ] **Step 7: Commit the frontend change**

Run:

```bash
git add blog-admin/src/pages/Article/DirectoryTree.tsx
git commit -m "fix: render article directory root container"
```

### Task 3: Final Verification

**Files:**
- Verify: `docs/superpowers/specs/2026-06-09-article-directory-root-design.md`
- Verify: `blog-service/src/test/java/com/blog/modules/article/service/impl/ArticleDirectoryServiceImplTest.java`
- Verify: `blog-admin/src/pages/Article/DirectoryTree.tsx`

- [ ] **Step 1: Re-run backend focused test**

Run:

```bash
cd blog-service
./gradlew test --tests com.blog.modules.article.service.impl.ArticleDirectoryServiceImplTest
```

Expected: PASS.

- [ ] **Step 2: Re-run admin build**

Run:

```bash
cd blog-admin
pnpm build
```

Expected: PASS.

- [ ] **Step 3: Check working tree**

Run:

```bash
git status --short
```

Expected: Only unrelated pre-existing changes remain, such as `.gitignore`.
