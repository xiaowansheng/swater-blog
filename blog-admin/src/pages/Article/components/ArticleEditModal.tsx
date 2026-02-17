import { useState, useEffect } from 'react'
import {
    Modal, Form, Input, Select, Switch, Button, Tag, message,
} from 'antd'
import {
    PlusOutlined,
    FormOutlined,
} from '@ant-design/icons'
import {
    getArticleById,
    saveArticle,
} from '@/api/article'
import { uploadFile } from '@/api/file'
import { toRelativeUrl } from '@/utils/format'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import TagSelector from './TagSelector'
import CategorySelector from './CategorySelector'
import ImageUpload from '@/components/common/ImageUpload'
import CoverGenerator from '@/components/article/CoverGenerator'
import { Article, Category, Tag as TagType, ArticleStatus, ArticleType } from '@/types'

interface ArticleEditModalProps {
    open: boolean
    article: Article | null
    onClose: () => void
    onSuccess: () => void
}

const ArticleEditModal: React.FC<ArticleEditModalProps> = ({
    open,
    article,
    onClose,
    onSuccess,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [showCoverGenerator, setShowCoverGenerator] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [allTags, setAllTags] = useState<TagType[]>([])

    // 加载分类和标签数据
    useEffect(() => {
        if (open) {
            loadCategories()
            loadTags()
        }
    }, [open])

    // 当 article 变化时设置表单值
    useEffect(() => {
        if (open && article) {
            form.setFieldsValue({
                title: article.title,
                articleKey: article.articleKey || '',
                slug: article.slug || '',
                excerpt: article.excerpt || '',
                cover: article.cover || '',
                categoryId: article.categoryId,
                categoryName: article.categoryName,
                tagIds: article.tags?.map(t => t.id) || [],
                type: article.type || ArticleType.ORIGINAL,
                status: article.status,
                isTop: article.isTop === 1,
                originalAuthor: article.originalAuthor || '',
                originalTitle: article.originalTitle || '',
                originalUrl: article.originalUrl || '',
                note: article.note || '',
            })
        }
    }, [open, article, form])

    const loadCategories = async () => {
        try {
            const data = await getCategoryList()
            setCategories(data)
        } catch (error) {
            console.error('加载分类失败', error)
        }
    }

    const loadTags = async () => {
        try {
            const data = await getTagList()
            setAllTags(data)
        } catch (error) {
            console.error('加载标签失败', error)
        }
    }

    const handleCancel = () => {
        form.resetFields()
        onClose()
    }

    const handleSubmit = async () => {
        if (!article) return
        try {
            const values = await form.validateFields()
            setLoading(true)

            // 先获取完整文章以得到 content
            const fullArticle = await getArticleById(article.id)

            await saveArticle({
                id: article.id,
                title: values.title,
                slug: values.slug || undefined,
                content: fullArticle.content,
                excerpt: values.excerpt || undefined,
                cover: values.cover || undefined,
                categoryId: typeof values.categoryId === 'number' ? values.categoryId : undefined,
                categoryName: typeof values.categoryId === 'string' ? values.categoryId : undefined,
                type: values.type,
                originalAuthor: values.originalAuthor || undefined,
                originalTitle: values.originalTitle || undefined,
                originalUrl: values.originalUrl || undefined,
                note: values.note || undefined,
                status: values.status,
                isTop: values.isTop ? 1 : 0,
                tagIds: values.tagIds?.filter((id: number | string) => typeof id === 'number') || [],
                tagNames: values.tagIds?.filter((id: number | string) => typeof id === 'string') || [],
                articleKey: values.articleKey || undefined,
            })

            message.success('修改成功')
            form.resetFields()
            onSuccess()
        } catch (error: any) {
            if (error?.errorFields) return // 表单验证失败
            message.error('修改失败')
        } finally {
            setLoading(false)
        }
    }

    const handleCoverGenerated = async (imageUrl: string) => {
        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const timestamp = Date.now()
            const random = Math.random().toString(36).substring(7)
            const file = new File([blob], `cover_${timestamp}_${random}.png`, { type: 'image/png' })

            message.loading({ content: '正在上传封面...', key: 'uploadCover' })
            const result = await uploadFile(file)
            const coverUrl = toRelativeUrl(result.url || result.storagePath || result.filePath || '')

            form.setFieldsValue({ cover: coverUrl })
            setTimeout(() => form.validateFields(['cover']), 0)

            message.success({ content: '封面已生成并上传成功', key: 'uploadCover' })
        } catch (error) {
            console.error('上传封面失败', error)
            message.error({ content: '封面上传失败', key: 'uploadCover' })
        }
    }

    return (
        <>
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <FormOutlined />
                        <span>修改文章属性</span>
                        {article && (
                            <Tag color="blue" className="ml-2">ID: {article.id}</Tag>
                        )}
                    </div>
                }
                open={open}
                onCancel={handleCancel}
                width={720}
                destroyOnClose
                footer={
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <Button onClick={handleCancel}>
                            取消
                        </Button>
                        <Button type="primary" loading={loading} onClick={handleSubmit}>
                            保存修改
                        </Button>
                    </div>
                }
                styles={{
                    body: {
                        maxHeight: 'calc(80vh - 140px)',
                        overflowY: 'auto',
                        paddingRight: 8,
                    },
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <Form.Item
                        label="封面图片"
                        name="cover"
                    >
                        <ImageUpload
                            placeholder="点击或拖拽上传文章封面"
                        />
                    </Form.Item>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setShowCoverGenerator(true)}
                        style={{ width: '100%' }}
                        className="mb-4"
                    >
                        生成封面
                    </Button>

                    <Form.Item
                        label="文章标题"
                        name="title"
                        rules={[{ required: true, message: '请输入文章标题' }]}
                    >
                        <Input placeholder="请输入文章标题" maxLength={200} showCount />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="文章Key"
                            name="articleKey"
                        >
                            <Input placeholder="文章唯一标识 (可选)" />
                        </Form.Item>
                        <Form.Item
                            label="Slug"
                            name="slug"
                        >
                            <Input placeholder="URL友好名称 (可选)" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="摘要"
                        name="excerpt"
                    >
                        <Input.TextArea placeholder="文章摘要 (可选)" rows={3} maxLength={500} showCount />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="分类"
                            name="categoryId"
                            rules={[{ required: true, message: '请选择或输入文章分类' }]}
                        >
                            <CategorySelector categories={categories} />
                        </Form.Item>
                        <Form.Item
                            label="文章类型"
                            name="type"
                        >
                            <Select placeholder="选择类型">
                                <Select.Option value={ArticleType.ORIGINAL}>原创</Select.Option>
                                <Select.Option value={ArticleType.REPOST}>转载</Select.Option>
                                <Select.Option value={ArticleType.TRANSLATION}>翻译</Select.Option>
                                <Select.Option value={ArticleType.QUOTE}>引用</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="标签"
                        name="tagIds"
                    >
                        <TagSelector tags={allTags} maxCount={10} />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="文章状态"
                            name="status"
                        >
                            <Select placeholder="选择状态">
                                <Select.Option value={ArticleStatus.DRAFT}>草稿</Select.Option>
                                <Select.Option value={ArticleStatus.PUBLISHED}>已发布</Select.Option>
                                <Select.Option value={ArticleStatus.PRIVATE}>私密</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="置顶"
                            name="isTop"
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="置顶" unCheckedChildren="普通" />
                        </Form.Item>
                    </div>

                    {/* 转载/翻译/引用时显示的来源信息 */}
                    <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                        {({ getFieldValue }) => {
                            const type = getFieldValue('type')
                            if (type && type !== ArticleType.ORIGINAL) {
                                return (
                                    <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                                        <div className="text-sm font-medium text-gray-600 mb-3">来源信息</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Form.Item
                                                label="原作者"
                                                name="originalAuthor"
                                                className="mb-2"
                                            >
                                                <Input placeholder="原文作者" />
                                            </Form.Item>
                                            <Form.Item
                                                label="原标题"
                                                name="originalTitle"
                                                className="mb-2"
                                            >
                                                <Input placeholder="原文标题" />
                                            </Form.Item>
                                        </div>
                                        <Form.Item
                                            label="原文链接"
                                            name="originalUrl"
                                            className="mb-0"
                                        >
                                            <Input placeholder="原文URL" />
                                        </Form.Item>
                                    </div>
                                )
                            }
                            return null
                        }}
                    </Form.Item>

                    <Form.Item
                        label="备注"
                        name="note"
                    >
                        <Input.TextArea placeholder="文章备注 (可选)" rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 封面生成器 */}
            <CoverGenerator
                visible={showCoverGenerator}
                onCancel={() => setShowCoverGenerator(false)}
                onConfirm={handleCoverGenerated}
                initialText={form.getFieldValue('title') || ''}
            />
        </>
    )
}

export default ArticleEditModal
