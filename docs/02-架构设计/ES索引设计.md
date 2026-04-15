# Elasticsearch索引设计文档

## 1. 索引概述

使用Elasticsearch实现全文搜索功能，支持文章、说说、评论的搜索。

## 2. 索引设计

### 2.1 文章索引 (post_index)

**索引设置**:
```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "ik_max_word": {
          "type": "ik_max_word"
        },
        "ik_smart": {
          "type": "ik_smart"
        }
      }
    }
  }
}
```

**映射结构**:
```json
{
  "mappings": {
    "properties": {
      "id": {
        "type": "long"
      },
      "title": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "content": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart"
      },
      "excerpt": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "authorId": {
        "type": "long"
      },
      "categoryId": {
        "type": "long"
      },
      "tagIds": {
        "type": "long"
      },
      "status": {
        "type": "integer"
      },
      "publishedAt": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      },
      "viewCount": {
        "type": "integer"
      },
      "likeCount": {
        "type": "integer"
      },
      "commentCount": {
        "type": "integer"
      },
      "isTop": {
        "type": "boolean"
      },
      "createTime": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      }
    }
  }
}
```

### 2.2 说说索引 (moment_index)

**映射结构**:
```json
{
  "mappings": {
    "properties": {
      "id": {
        "type": "long"
      },
      "content": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart"
      },
      "authorId": {
        "type": "long"
      },
      "likeCount": {
        "type": "integer"
      },
      "commentCount": {
        "type": "integer"
      },
      "createTime": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      }
    }
  }
}
```

### 2.3 评论索引 (comment_index)

**映射结构**:
```json
{
  "mappings": {
    "properties": {
      "id": {
        "type": "long"
      },
      "content": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart"
      },
      "postId": {
        "type": "long"
      },
      "momentId": {
        "type": "long"
      },
      "userId": {
        "type": "long"
      },
      "parentId": {
        "type": "long"
      },
      "status": {
        "type": "integer"
      },
      "createTime": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      }
    }
  }
}
```

## 3. 文档模型

### 3.1 文章文档 (PostDocument)

```java
@Document(indexName = "post_index")
@Data
public class PostDocument {
    @Id
    private Long id;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word", searchAnalyzer = "ik_smart")
    private String title;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word", searchAnalyzer = "ik_smart")
    private String content;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String excerpt;
    
    @Field(type = FieldType.Long)
    private Long authorId;
    
    @Field(type = FieldType.Long)
    private Long categoryId;
    
    @Field(type = FieldType.Long)
    private List<Long> tagIds;
    
    @Field(type = FieldType.Integer)
    private Integer status;
    
    @Field(type = FieldType.Date, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishedAt;
    
    @Field(type = FieldType.Integer)
    private Integer viewCount;
    
    @Field(type = FieldType.Integer)
    private Integer likeCount;
    
    @Field(type = FieldType.Integer)
    private Integer commentCount;
    
    @Field(type = FieldType.Boolean)
    private Boolean isTop;
    
    @Field(type = FieldType.Date, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
```

### 3.2 说说文档 (MomentDocument)

```java
@Document(indexName = "moment_index")
@Data
public class MomentDocument {
    @Id
    private Long id;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word", searchAnalyzer = "ik_smart")
    private String content;
    
    @Field(type = FieldType.Long)
    private Long authorId;
    
    @Field(type = FieldType.Integer)
    private Integer likeCount;
    
    @Field(type = FieldType.Integer)
    private Integer commentCount;
    
    @Field(type = FieldType.Date, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
```

### 3.3 评论文档 (CommentDocument)

```java
@Document(indexName = "comment_index")
@Data
public class CommentDocument {
    @Id
    private Long id;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word", searchAnalyzer = "ik_smart")
    private String content;
    
    @Field(type = FieldType.Long)
    private Long postId;
    
    @Field(type = FieldType.Long)
    private Long momentId;
    
    @Field(type = FieldType.Long)
    private Long userId;
    
    @Field(type = FieldType.Long)
    private Long parentId;
    
    @Field(type = FieldType.Integer)
    private Integer status;
    
    @Field(type = FieldType.Date, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
```

## 4. 搜索实现

### 4.1 全文搜索

```java
public Page<PostDocument> search(String keyword, Pageable pageable) {
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
    
    // 多字段搜索
    MultiMatchQueryBuilder multiMatchQuery = QueryBuilders
        .multiMatchQuery(keyword, "title", "content", "excerpt")
        .type(MultiMatchQueryBuilder.Type.BEST_FIELDS)
        .fuzziness(Fuzziness.AUTO);
    
    queryBuilder.withQuery(multiMatchQuery);
    
    // 高亮
    queryBuilder.withHighlightFields(
        new HighlightBuilder.Field("title"),
        new HighlightBuilder.Field("content")
    );
    
    // 排序
    queryBuilder.withSort(SortBuilders.fieldSort("isTop").order(SortOrder.DESC));
    queryBuilder.withSort(SortBuilders.fieldSort("publishedAt").order(SortOrder.DESC));
    
    // 分页
    queryBuilder.withPageable(pageable);
    
    return esTemplate.search(queryBuilder.build(), PostDocument.class);
}
```

### 4.2 条件搜索

```java
public Page<PostDocument> searchByCategory(Long categoryId, Pageable pageable) {
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();
    
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    boolQuery.must(QueryBuilders.termQuery("categoryId", categoryId));
    boolQuery.must(QueryBuilders.termQuery("status", 1));
    
    queryBuilder.withQuery(boolQuery);
    queryBuilder.withPageable(pageable);
    
    return esTemplate.search(queryBuilder.build(), PostDocument.class);
}
```

## 5. 数据同步

### 5.1 创建/更新时同步

```java
public void saveOrUpdatePost(Post post) {
    // 保存到数据库
    postMapper.insert(post);
    
    // 同步到ES
    PostDocument document = convertToDocument(post);
    esTemplate.save(document);
}
```

### 5.2 删除时同步

```java
public void deletePost(Long id) {
    // 逻辑删除
    postMapper.deleteById(id);
    
    // 从ES删除
    esTemplate.delete(String.valueOf(id), PostDocument.class);
}
```

### 5.3 批量同步

```java
@Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点
public void syncAllPosts() {
    // 查询所有已发布的文章
    List<Post> posts = postMapper.selectList(
        new LambdaQueryWrapper<Post>()
            .eq(Post::getStatus, 1)
            .eq(Post::getDeleted, 0)
    );
    
    // 批量同步到ES
    List<PostDocument> documents = posts.stream()
        .map(this::convertToDocument)
        .collect(Collectors.toList());
    
    esTemplate.save(documents);
}
```

## 6. 搜索优化

### 6.1 分词器

- 使用IK分词器
- 索引时使用ik_max_word（细粒度）
- 搜索时使用ik_smart（粗粒度）

### 6.2 搜索建议

```java
public List<String> suggest(String keyword) {
    CompletionSuggestionBuilder suggestion = SuggestBuilders
        .completionSuggestion("title.suggest")
        .prefix(keyword)
        .size(10);
    
    SuggestRequestBuilder suggestRequest = esTemplate.suggest()
        .addSuggestion("suggest", suggestion);
    
    // 执行搜索建议
    // ...
}
```

### 6.3 热门搜索

- 记录搜索关键词
- 统计搜索次数
- 返回热门搜索词

## 7. 索引维护

### 7.1 索引重建

```java
public void rebuildIndex() {
    // 删除旧索引
    esTemplate.indexOps(PostDocument.class).delete();
    
    // 创建新索引
    esTemplate.indexOps(PostDocument.class).create();
    
    // 同步数据
    syncAllPosts();
}
```

### 7.2 索引优化

- 定期优化索引
- 清理无用数据
- 监控索引大小

