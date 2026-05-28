package com.blog.modules.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.mapper.ArticleDirectoryMapper;
import com.blog.modules.article.mapper.DirectoryNodeMapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.dto.ArticleDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryAssignArticleDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryCreateArticleDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryMoveDTO;
import com.blog.modules.article.model.dto.DirectoryNodeDTO;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.entity.ArticleDirectory;
import com.blog.modules.article.model.entity.DirectoryNode;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.model.vo.ArticleDirectoryItemVO;
import com.blog.modules.article.service.ArticleCommandService;
import com.blog.modules.article.service.ArticleDirectoryService;
import com.blog.modules.category.mapper.CategoryMapper;
import com.blog.modules.category.model.entity.Category;
import com.blog.shared.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ArticleDirectoryServiceImpl implements ArticleDirectoryService {
    private static final Long ROOT_ID = 0L;
    private static final String TYPE_NODE = "NODE";
    private static final String TYPE_ARTICLE = "ARTICLE";
    private static final String TARGET_ROOT = "ROOT";
    private static final String POSITION_INSIDE = "INSIDE";
    private static final String POSITION_BEFORE = "BEFORE";
    private static final String POSITION_AFTER = "AFTER";
    private static final int SORT_STEP = 10;

    @Autowired
    private DirectoryNodeMapper nodeMapper;

    @Autowired
    private ArticleDirectoryMapper directoryArticleMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private ArticleCommandService articleCommandService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<ArticleDirectoryItemVO> tree() {
        ensureUnassignedArticlesAtRoot();

        List<DirectoryNode> nodes = nodeMapper.selectList(new LambdaQueryWrapper<DirectoryNode>()
                .orderByAsc(DirectoryNode::getParentId)
                .orderByAsc(DirectoryNode::getSort)
                .orderByAsc(DirectoryNode::getId));
        List<ArticleDirectory> placements = directoryArticleMapper.selectList(new LambdaQueryWrapper<ArticleDirectory>()
                .orderByAsc(ArticleDirectory::getNodeId)
                .orderByAsc(ArticleDirectory::getSort)
                .orderByAsc(ArticleDirectory::getId));

        Map<Long, Article> articleMap = loadArticleMap(placements);
        Map<Long, Category> categoryMap = loadCategoryMap(articleMap);

        Map<Long, ArticleDirectoryItemVO> nodeVoMap = new HashMap<>();
        for (DirectoryNode node : nodes) {
            nodeVoMap.put(node.getId(), toNodeVO(node));
        }

        List<ArticleDirectoryItemVO> roots = new ArrayList<>();
        for (DirectoryNode node : nodes) {
            ArticleDirectoryItemVO nodeVO = nodeVoMap.get(node.getId());
            Long parentId = normalizeParentId(node.getParentId());
            if (ROOT_ID.equals(parentId)) {
                roots.add(nodeVO);
                continue;
            }
            ArticleDirectoryItemVO parent = nodeVoMap.get(parentId);
            if (parent == null) {
                roots.add(nodeVO);
            } else {
                parent.getChildren().add(nodeVO);
            }
        }

        for (ArticleDirectory placement : placements) {
            Article article = articleMap.get(placement.getArticleId());
            if (article == null) {
                continue;
            }
            ArticleDirectoryItemVO articleVO = toArticleVO(placement, article, categoryMap.get(article.getCategoryId()));
            Long parentId = normalizeParentId(placement.getNodeId());
            if (ROOT_ID.equals(parentId)) {
                roots.add(articleVO);
                continue;
            }
            ArticleDirectoryItemVO parent = nodeVoMap.get(parentId);
            if (parent == null) {
                roots.add(articleVO);
            } else {
                parent.getChildren().add(articleVO);
            }
        }

        sortRecursively(roots);
        return roots;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createNode(DirectoryNodeDTO dto) {
        Long parentId = normalizeParentId(dto.getParentId());
        assertParentExists(parentId);

        DirectoryNode node = new DirectoryNode();
        node.setName(dto.getName().trim());
        node.setDescription(dto.getDescription());
        node.setParentId(parentId);
        node.setSort(dto.getSort() == null ? nextSort(parentId) : dto.getSort());
        nodeMapper.insert(node);
        return node.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateNode(Long id, DirectoryNodeDTO dto) {
        DirectoryNode node = nodeMapper.selectById(id);
        if (node == null) {
            throw new BusinessException("目录节点不存在");
        }

        Long oldParentId = normalizeParentId(node.getParentId());
        Long newParentId = normalizeParentId(dto.getParentId());
        assertParentExists(newParentId);
        ensureNodeCanMoveTo(id, newParentId);

        node.setName(dto.getName().trim());
        node.setDescription(dto.getDescription());
        node.setParentId(newParentId);
        if (dto.getSort() != null) {
            node.setSort(dto.getSort());
        } else if (!oldParentId.equals(newParentId)) {
            node.setSort(nextSort(newParentId));
        }
        nodeMapper.updateById(node);

        if (!oldParentId.equals(newParentId)) {
            reorderParent(oldParentId, null);
            reorderParent(newParentId, null);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteNode(Long id) {
        DirectoryNode node = nodeMapper.selectById(id);
        if (node == null) {
            throw new BusinessException("目录节点不存在");
        }
        Long childNodeCount = nodeMapper.selectCount(new LambdaQueryWrapper<DirectoryNode>()
                .eq(DirectoryNode::getParentId, id));
        Long childArticleCount = directoryArticleMapper.selectCount(new LambdaQueryWrapper<ArticleDirectory>()
                .eq(ArticleDirectory::getNodeId, id));
        if (childNodeCount > 0 || childArticleCount > 0) {
            throw new BusinessException("目录节点下还有子节点或文章，禁止删除");
        }

        Long parentId = normalizeParentId(node.getParentId());
        nodeMapper.deleteById(id);
        reorderParent(parentId, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void move(ArticleDirectoryMoveDTO dto) {
        ItemRef moving = loadItemRef(dto.getItemType(), dto.getItemId());
        TargetPlan targetPlan = resolveTargetPlan(dto);

        if (sameItem(moving, targetPlan.target) && !POSITION_INSIDE.equals(dto.getPosition())) {
            return;
        }
        if (TYPE_NODE.equals(moving.type)) {
            ensureNodeCanMoveTo(moving.id, targetPlan.parentId);
        }

        Long oldParentId = moving.parentId;
        updateItemParent(moving, targetPlan.parentId);

        if (!oldParentId.equals(targetPlan.parentId)) {
            reorderParent(oldParentId, null);
        }
        reorderParent(targetPlan.parentId, new InsertPlan(moving, targetPlan));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignArticle(ArticleDirectoryAssignArticleDTO dto) {
        Long parentId = normalizeParentId(dto.getParentId());
        assertParentExists(parentId);

        ArticleDirectory placement = ensureArticlePlacement(dto.getArticleId(), parentId);
        Long oldParentId = normalizeParentId(placement.getNodeId());
        placement.setNodeId(parentId);
        placement.setSort(nextSort(parentId));
        directoryArticleMapper.updateById(placement);

        if (!oldParentId.equals(parentId)) {
            reorderParent(oldParentId, null);
        }
        reorderParent(parentId, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createArticle(ArticleDirectoryCreateArticleDTO dto) {
        Long parentId = normalizeParentId(dto.getParentId());
        assertParentExists(parentId);

        ArticleDTO articleDTO = new ArticleDTO();
        articleDTO.setTitle(dto.getTitle().trim());
        articleDTO.setContent("# " + dto.getTitle().trim() + "\n");
        articleDTO.setStatus(ArticleStatus.DRAFT.getCode());
        articleDTO.setType("1");
        articleDTO.setIsTop(0);

        Long articleId = articleCommandService.create(articleDTO);
        ArticleDirectory placement = new ArticleDirectory();
        placement.setArticleId(articleId);
        placement.setNodeId(parentId);
        placement.setSort(nextSort(parentId));
        directoryArticleMapper.insert(placement);
        return articleId;
    }

    private void ensureUnassignedArticlesAtRoot() {
        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .select(Article::getId)
                .orderByAsc(Article::getId));
        if (articles.isEmpty()) {
            return;
        }

        Set<Long> assignedArticleIds = directoryArticleMapper.selectList(new LambdaQueryWrapper<ArticleDirectory>())
                .stream()
                .map(ArticleDirectory::getArticleId)
                .collect(Collectors.toSet());
        for (Article article : articles) {
            if (assignedArticleIds.contains(article.getId())) {
                continue;
            }
            ArticleDirectory placement = new ArticleDirectory();
            placement.setArticleId(article.getId());
            placement.setNodeId(ROOT_ID);
            placement.setSort(nextSort(ROOT_ID));
            directoryArticleMapper.insert(placement);
        }
    }

    private Map<Long, Article> loadArticleMap(List<ArticleDirectory> placements) {
        List<Long> articleIds = placements.stream()
                .map(ArticleDirectory::getArticleId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (articleIds.isEmpty()) {
            return Map.of();
        }
        return articleMapper.selectBatchIds(articleIds).stream()
                .collect(Collectors.toMap(Article::getId, article -> article));
    }

    private Map<Long, Category> loadCategoryMap(Map<Long, Article> articleMap) {
        List<Long> categoryIds = articleMap.values().stream()
                .map(Article::getCategoryId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (categoryIds.isEmpty()) {
            return Map.of();
        }
        return categoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, category -> category));
    }

    private ArticleDirectoryItemVO toNodeVO(DirectoryNode node) {
        ArticleDirectoryItemVO vo = new ArticleDirectoryItemVO();
        vo.setKey("node-" + node.getId());
        vo.setType(TYPE_NODE);
        vo.setId(node.getId());
        vo.setParentId(normalizeParentId(node.getParentId()));
        vo.setSort(node.getSort());
        vo.setName(node.getName());
        vo.setDescription(node.getDescription());
        vo.setCreateTime(node.getCreateTime());
        vo.setUpdateTime(node.getUpdateTime());
        return vo;
    }

    private ArticleDirectoryItemVO toArticleVO(
            ArticleDirectory placement,
            Article article,
            Category category
    ) {
        ArticleDirectoryItemVO vo = new ArticleDirectoryItemVO();
        vo.setKey("article-" + article.getId());
        vo.setType(TYPE_ARTICLE);
        vo.setId(article.getId());
        vo.setParentId(normalizeParentId(placement.getNodeId()));
        vo.setSort(placement.getSort());
        vo.setName(article.getTitle());
        vo.setTitle(article.getTitle());
        vo.setArticleId(article.getId());
        vo.setArticleKey(article.getArticleKey());
        vo.setSlug(article.getSlug());
        vo.setCover(article.getCover());
        vo.setStatus(article.getStatus());
        vo.setCategoryId(article.getCategoryId());
        vo.setCategoryName(category == null ? null : category.getName());
        vo.setCreateTime(article.getCreateTime());
        vo.setUpdateTime(article.getUpdateTime());
        return vo;
    }

    private void sortRecursively(List<ArticleDirectoryItemVO> items) {
        items.sort(Comparator
                .comparing((ArticleDirectoryItemVO item) -> item.getSort() == null ? 0 : item.getSort())
                .thenComparing(item -> TYPE_NODE.equals(item.getType()) ? 0 : 1)
                .thenComparing(ArticleDirectoryItemVO::getId));
        for (ArticleDirectoryItemVO item : items) {
            if (item.getChildren() != null && !item.getChildren().isEmpty()) {
                sortRecursively(item.getChildren());
            }
        }
    }

    private TargetPlan resolveTargetPlan(ArticleDirectoryMoveDTO dto) {
        String position = dto.getPosition();
        if (POSITION_INSIDE.equals(position)) {
            if (TARGET_ROOT.equals(dto.getTargetType())) {
                return new TargetPlan(ROOT_ID, null, POSITION_INSIDE);
            }
            if (!TYPE_NODE.equals(dto.getTargetType())) {
                throw new BusinessException("只能将项目放入根目录或目录节点");
            }
            DirectoryNode targetNode = nodeMapper.selectById(dto.getTargetId());
            if (targetNode == null) {
                throw new BusinessException("目标目录节点不存在");
            }
            return new TargetPlan(targetNode.getId(), new ItemRef(TYPE_NODE, targetNode.getId(), null, normalizeParentId(targetNode.getParentId())), POSITION_INSIDE);
        }

        if (TARGET_ROOT.equals(dto.getTargetType())) {
            throw new BusinessException("根目录只支持放入操作");
        }

        ItemRef target = loadItemRef(dto.getTargetType(), dto.getTargetId());
        return new TargetPlan(target.parentId, target, position);
    }

    private ItemRef loadItemRef(String type, Long id) {
        if (TYPE_NODE.equals(type)) {
            DirectoryNode node = nodeMapper.selectById(id);
            if (node == null) {
                throw new BusinessException("目录节点不存在");
            }
            return new ItemRef(TYPE_NODE, node.getId(), null, normalizeParentId(node.getParentId()));
        }
        if (TYPE_ARTICLE.equals(type)) {
            ArticleDirectory placement = ensureArticlePlacement(id, ROOT_ID);
            return new ItemRef(TYPE_ARTICLE, placement.getArticleId(), placement.getId(), normalizeParentId(placement.getNodeId()));
        }
        throw new BusinessException("不支持的目录项目类型");
    }

    private ArticleDirectory ensureArticlePlacement(Long articleId, Long defaultParentId) {
        Article article = articleMapper.selectById(articleId);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }
        ArticleDirectory placement = directoryArticleMapper.selectOne(new LambdaQueryWrapper<ArticleDirectory>()
                .eq(ArticleDirectory::getArticleId, articleId)
                .last("LIMIT 1"));
        if (placement != null) {
            return placement;
        }

        ArticleDirectory created = new ArticleDirectory();
        created.setArticleId(articleId);
        created.setNodeId(defaultParentId);
        created.setSort(nextSort(defaultParentId));
        directoryArticleMapper.insert(created);
        return created;
    }

    private void updateItemParent(ItemRef item, Long parentId) {
        if (TYPE_NODE.equals(item.type)) {
            DirectoryNode node = new DirectoryNode();
            node.setId(item.id);
            node.setParentId(parentId);
            nodeMapper.updateById(node);
            return;
        }

        ArticleDirectory placement = new ArticleDirectory();
        placement.setId(item.relationId);
        placement.setNodeId(parentId);
        directoryArticleMapper.updateById(placement);
    }

    private void reorderParent(Long parentId, InsertPlan insertPlan) {
        List<SortItem> siblings = listSiblingItems(parentId);
        if (insertPlan != null) {
            siblings.removeIf(item -> item.sameAs(insertPlan.moving.type, insertPlan.moving.id));
            SortItem movingItem = SortItem.from(insertPlan.moving);
            if (POSITION_INSIDE.equals(insertPlan.targetPlan.position) || insertPlan.targetPlan.target == null) {
                siblings.add(movingItem);
            } else {
                int targetIndex = indexOf(siblings, insertPlan.targetPlan.target);
                if (targetIndex < 0) {
                    siblings.add(movingItem);
                } else {
                    int insertIndex = POSITION_AFTER.equals(insertPlan.targetPlan.position) ? targetIndex + 1 : targetIndex;
                    siblings.add(insertIndex, movingItem);
                }
            }
        }

        int sort = SORT_STEP;
        for (SortItem item : siblings) {
            if (TYPE_NODE.equals(item.type)) {
                DirectoryNode node = new DirectoryNode();
                node.setId(item.id);
                node.setParentId(parentId);
                node.setSort(sort);
                nodeMapper.updateById(node);
            } else {
                ArticleDirectory placement = new ArticleDirectory();
                placement.setId(item.relationId);
                placement.setNodeId(parentId);
                placement.setSort(sort);
                directoryArticleMapper.updateById(placement);
            }
            sort += SORT_STEP;
        }
    }

    private List<SortItem> listSiblingItems(Long parentId) {
        Long normalizedParentId = normalizeParentId(parentId);
        List<SortItem> items = new ArrayList<>();
        nodeMapper.selectList(new LambdaQueryWrapper<DirectoryNode>()
                        .eq(DirectoryNode::getParentId, normalizedParentId))
                .forEach(node -> items.add(new SortItem(TYPE_NODE, node.getId(), null, node.getSort())));
        directoryArticleMapper.selectList(new LambdaQueryWrapper<ArticleDirectory>()
                        .eq(ArticleDirectory::getNodeId, normalizedParentId))
                .forEach(placement -> items.add(new SortItem(TYPE_ARTICLE, placement.getArticleId(), placement.getId(), placement.getSort())));
        items.sort(Comparator
                .comparing((SortItem item) -> item.sort == null ? 0 : item.sort)
                .thenComparing(item -> TYPE_NODE.equals(item.type) ? 0 : 1)
                .thenComparing(item -> item.id));
        return items;
    }

    private int indexOf(List<SortItem> items, ItemRef target) {
        for (int index = 0; index < items.size(); index++) {
            if (items.get(index).sameAs(target.type, target.id)) {
                return index;
            }
        }
        return -1;
    }

    private void assertParentExists(Long parentId) {
        if (ROOT_ID.equals(normalizeParentId(parentId))) {
            return;
        }
        if (nodeMapper.selectById(parentId) == null) {
            throw new BusinessException("父级目录节点不存在");
        }
    }

    private void ensureNodeCanMoveTo(Long nodeId, Long parentId) {
        if (ROOT_ID.equals(normalizeParentId(parentId))) {
            return;
        }
        Long currentParentId = parentId;
        while (!ROOT_ID.equals(normalizeParentId(currentParentId))) {
            if (nodeId.equals(currentParentId)) {
                throw new BusinessException("不能将目录节点移动到自身或子节点下");
            }
            DirectoryNode parent = nodeMapper.selectById(currentParentId);
            if (parent == null) {
                return;
            }
            currentParentId = normalizeParentId(parent.getParentId());
        }
    }

    private int nextSort(Long parentId) {
        Long normalizedParentId = normalizeParentId(parentId);
        Integer maxNodeSort = nodeMapper.selectMaxSortByParentId(normalizedParentId);
        Integer maxArticleSort = directoryArticleMapper.selectMaxSortByNodeId(normalizedParentId);
        return Math.max(maxNodeSort == null ? 0 : maxNodeSort, maxArticleSort == null ? 0 : maxArticleSort) + SORT_STEP;
    }

    private Long normalizeParentId(Long parentId) {
        return parentId == null ? ROOT_ID : parentId;
    }

    private boolean sameItem(ItemRef left, ItemRef right) {
        return left != null && right != null && left.type.equals(right.type) && left.id.equals(right.id);
    }

    private static class ItemRef {
        private final String type;
        private final Long id;
        private final Long relationId;
        private final Long parentId;

        private ItemRef(String type, Long id, Long relationId, Long parentId) {
            this.type = type;
            this.id = id;
            this.relationId = relationId;
            this.parentId = parentId;
        }
    }

    private static class TargetPlan {
        private final Long parentId;
        private final ItemRef target;
        private final String position;

        private TargetPlan(Long parentId, ItemRef target, String position) {
            this.parentId = parentId;
            this.target = target;
            this.position = position;
        }
    }

    private static class InsertPlan {
        private final ItemRef moving;
        private final TargetPlan targetPlan;

        private InsertPlan(ItemRef moving, TargetPlan targetPlan) {
            this.moving = moving;
            this.targetPlan = targetPlan;
        }
    }

    private static class SortItem {
        private final String type;
        private final Long id;
        private final Long relationId;
        private final Integer sort;

        private SortItem(String type, Long id, Long relationId, Integer sort) {
            this.type = type;
            this.id = id;
            this.relationId = relationId;
            this.sort = sort;
        }

        private static SortItem from(ItemRef item) {
            return new SortItem(item.type, item.id, item.relationId, null);
        }

        private boolean sameAs(String otherType, Long otherId) {
            return type.equals(otherType) && id.equals(otherId);
        }
    }
}
