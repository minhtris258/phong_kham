import React from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Calendar, Tag } from 'lucide-react'; // hoặc dùng icon bạn thích

const ArticleDetail = () => {
  const { slug } = useParams(); // lấy slug từ URL
  const [article, setArticle] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Gọi API lấy bài viết theo slug
    fetch(`/api/articles/${slug}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!article) return <div className="text-center py-20 text-red-500">Không tìm thấy bài viết</div>;

  const renderContent = () => {
    return article.content.map((block, index) => {
      switch (block.type) {
        case 'heading':
          const HeadingTag = `h${block.level || 2}`;
          return (
            <HeadingTag key={index} className={`font-bold mt-8 mb-4 text-${block.level === 1 ? '3xl' : block.level === 2 ? '2xl' : 'xl'}`}>
              {block.text}
            </HeadingTag>
          );

        case 'paragraph':
          return (
            <p
              key={index}
              className="text-gray-700 leading-relaxed mb-4 text-justify"
              dangerouslySetInnerHTML={{ __html: block.text.replace(/\n/g, '<br>') }}
            />
          );

        case 'list':
          const ListTag = block.style === 'ordered' ? 'ol' : 'ul';
          const listClass = block.style === 'ordered' ? 'list-decimal' : 'list-disc';
          return (
            <ListTag key={index} className={`${listClass} ml-8 my-6 space-y-2 text-gray-700`}>
              {block.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );

        case 'image':
          return (
            <div key={index} className="my-8 text-center">
              <img src={block.url} alt={block.alt || ''} className="max-w-full h-auto rounded-lg shadow-lg mx-auto" />
              {block.caption && <p className="text-sm text-gray-600 mt-2 italic">{block.caption}</p>}
            </div>
          );

        default:
          return null;
      }
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {article.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <time>
              {format(new Date(article.publishedAt), 'dd/MM/yyyy')}
            </time>
          </div>
          {article.updatedAt && article.updatedAt !== article.publishedAt && (
            <>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Cập nhật: {format(new Date(article.updatedAt), 'dd/MM/yyyy')}</span>
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="mb-10 -mx-4 md:mx-0">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-auto md:rounded-xl shadow-xl object-cover max-h-96"
          />
        </div>
      )}

      {/* Nội dung bài viết - Render động */}
      <div className="prose prose-lg max-w-none">
        {renderContent()}
      </div>

      {/* Footer - trạng thái, chia sẻ, v.v. */}
      <footer className="mt-16 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            article.status === 'Công khai' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {article.status}
          </span>
        </div>
      </footer>
    </article>
  );
};

export default ArticleDetail;