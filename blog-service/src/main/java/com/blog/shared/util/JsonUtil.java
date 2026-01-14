package com.blog.shared.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * JSON 工具类
 * 提供 JSON 序列化和反序列化功能
 */
@Slf4j
public class JsonUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

    static {
        // 注册 JavaTimeModule 支持 Java 8 日期时间类型
        mapper.registerModule(new JavaTimeModule());

        // 配置日期序列化格式
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // 忽略未知属性
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        // 允许空对象
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        // 包含 null 值
        mapper.setSerializationInclusion(JsonInclude.Include.ALWAYS);

        // 美化输出（可选，用于调试）
        // mapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    /**
     * 对象转 JSON 字符串
     */
    public static String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("JSON序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON序列化失败", e);
        }
    }

    /**
     * 对象转美化的 JSON 字符串
     */
    public static String toPrettyJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("JSON序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON序列化失败", e);
        }
    }

    /**
     * JSON 字符串转对象
     */
    public static <T> T fromJson(String json, Class<T> clazz) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return mapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            log.error("JSON反序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化失败", e);
        }
    }

    /**
     * JSON 字符串转对象（使用 TypeReference 支持泛型）
     */
    public static <T> T fromJson(String json, TypeReference<T> typeReference) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return mapper.readValue(json, typeReference);
        } catch (JsonProcessingException e) {
            log.error("JSON反序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化失败", e);
        }
    }

    /**
     * JSON 字符串转 List
     */
    public static <T> List<T> fromJsonToList(String json, Class<T> clazz) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return mapper.readValue(json, 
                mapper.getTypeFactory().constructCollectionType(List.class, clazz));
        } catch (JsonProcessingException e) {
            log.error("JSON反序列化为List失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化为List失败", e);
        }
    }

    /**
     * JSON 字符串转 Map
     */
    public static Map<String, Object> fromJsonToMap(String json) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            log.error("JSON反序列化为Map失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON反序列化为Map失败", e);
        }
    }

    /**
     * InputStream 转对象
     */
    public static <T> T fromInputStream(InputStream inputStream, Class<T> clazz) {
        if (inputStream == null) {
            return null;
        }
        try {
            return mapper.readValue(inputStream, clazz);
        } catch (IOException e) {
            log.error("从InputStream反序列化失败: {}", e.getMessage(), e);
            throw new RuntimeException("从InputStream反序列化失败", e);
        }
    }

    /**
     * 对象转换（通过 JSON 中转）
     */
    public static <T> T convertValue(Object obj, Class<T> clazz) {
        if (obj == null) {
            return null;
        }
        try {
            return mapper.convertValue(obj, clazz);
        } catch (IllegalArgumentException e) {
            log.error("对象转换失败: {}", e.getMessage(), e);
            throw new RuntimeException("对象转换失败", e);
        }
    }

    /**
     * 对象转换（使用 TypeReference 支持泛型）
     */
    public static <T> T convertValue(Object obj, TypeReference<T> typeReference) {
        if (obj == null) {
            return null;
        }
        try {
            return mapper.convertValue(obj, typeReference);
        } catch (IllegalArgumentException e) {
            log.error("对象转换失败: {}", e.getMessage(), e);
            throw new RuntimeException("对象转换失败", e);
        }
    }

    /**
     * JSON 字符串转 JsonNode
     */
    public static JsonNode parseJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return mapper.readTree(json);
        } catch (JsonProcessingException e) {
            log.error("JSON解析失败: {}", e.getMessage(), e);
            throw new RuntimeException("JSON解析失败", e);
        }
    }

    /**
     * 验证 JSON 字符串是否有效
     */
    public static boolean isValidJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            return false;
        }
        try {
            mapper.readTree(json);
            return true;
        } catch (JsonProcessingException e) {
            return false;
        }
    }

    /**
     * 获取 ObjectMapper 实例
     */
    public static ObjectMapper getMapper() {
        return mapper;
    }

    /**
     * 创建新的 ObjectMapper 实例（用于特殊配置）
     */
    public static ObjectMapper createMapper() {
        ObjectMapper newMapper = new ObjectMapper();
        newMapper.registerModule(new JavaTimeModule());
        newMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        newMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        newMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        return newMapper;
    }
}

