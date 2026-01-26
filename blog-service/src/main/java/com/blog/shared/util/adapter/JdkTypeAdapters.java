package com.blog.shared.util.adapter;


import com.google.gson.*;

import java.io.File;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.Path;

/**
 * description: 解决 JDK 模块强封装/以及日志对象中常见 JDK 类型的序列化问题
 *
 * @author xiaowansheng
 * @since 2026/1/15 14:56
 */

public final class JdkTypeAdapters {

    private JdkTypeAdapters() {}

    public static void register(GsonBuilder builder) {
        // File -> path string
        builder.registerTypeAdapter(File.class, new FileAdapter());

        // Path -> string
        builder.registerTypeAdapter(Path.class, new PathAdapter());

        // URL / URI -> string（日志里也常见）
        builder.registerTypeAdapter(URL.class, new UrlAdapter());
        builder.registerTypeAdapter(URI.class, new UriAdapter());

        // Charset -> name
        builder.registerTypeAdapter(Charset.class, new CharsetAdapter());
    }

    static final class FileAdapter implements JsonSerializer<File>, JsonDeserializer<File> {
        @Override
        public JsonElement serialize(File src, Type typeOfSrc, JsonSerializationContext context) {
            return (src == null) ? JsonNull.INSTANCE : new JsonPrimitive(src.getPath());
        }

        @Override
        public File deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                throws JsonParseException {
            if (json == null || json.isJsonNull()) return null;
            return new File(json.getAsString());
        }
    }

    static final class PathAdapter implements JsonSerializer<Path> {
        @Override
        public JsonElement serialize(Path src, Type typeOfSrc, JsonSerializationContext context) {
            return (src == null) ? JsonNull.INSTANCE : new JsonPrimitive(src.toString());
        }
    }

    static final class UrlAdapter implements JsonSerializer<URL>, JsonDeserializer<URL> {
        @Override
        public JsonElement serialize(URL src, Type typeOfSrc, JsonSerializationContext context) {
            return (src == null) ? JsonNull.INSTANCE : new JsonPrimitive(src.toString());
        }

        @Override
        public URL deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                throws JsonParseException {
            if (json == null || json.isJsonNull()) return null;
            try {
                return new URL(json.getAsString());
            } catch (Exception e) {
                throw new JsonParseException("Invalid URL: " + json.getAsString(), e);
            }
        }
    }

    static final class UriAdapter implements JsonSerializer<URI>, JsonDeserializer<URI> {
        @Override
        public JsonElement serialize(URI src, Type typeOfSrc, JsonSerializationContext context) {
            return (src == null) ? JsonNull.INSTANCE : new JsonPrimitive(src.toString());
        }

        @Override
        public URI deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                throws JsonParseException {
            if (json == null || json.isJsonNull()) return null;
            try {
                return URI.create(json.getAsString());
            } catch (Exception e) {
                throw new JsonParseException("Invalid URI: " + json.getAsString(), e);
            }
        }
    }

    static final class CharsetAdapter implements JsonSerializer<Charset>, JsonDeserializer<Charset> {
        @Override
        public JsonElement serialize(Charset src, Type typeOfSrc, JsonSerializationContext context) {
            return (src == null) ? JsonNull.INSTANCE : new JsonPrimitive(src.name());
        }

        @Override
        public Charset deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                throws JsonParseException {
            if (json == null || json.isJsonNull()) return null;
            try {
                return Charset.forName(json.getAsString());
            } catch (Exception e) {
                throw new JsonParseException("Invalid Charset: " + json.getAsString(), e);
            }
        }
    }
}
