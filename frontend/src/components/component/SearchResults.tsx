import { SearchPage } from "./productpage";
import { SearchIcon, FilterIcon, GridIcon, ListIcon, TagIcon } from "lucide-react";
import Link from "next/link";

interface SearchResultsProps {
    query: string;
    category: string;
    page: number;
}

export function SearchResults({ query, category, page }: SearchResultsProps) {
    // Related keywords based on search query
    const getRelatedKeywords = (searchQuery: string) => {
        const keywords = {
            'men': ['men\'s clothing', 'men\'s fashion', 'men\'s wear', 'men\'s accessories', 'men\'s shoes'],
            'women': ['women\'s clothing', 'women\'s fashion', 'women\'s wear', 'women\'s accessories', 'women\'s shoes'],
            'saree': ['sarees', 'sari', 'traditional wear', 'ethnic wear', 'indian clothing'],
            'lehenga': ['lehengas', 'bridal wear', 'party wear', 'indian dress', 'ethnic dress'],
            'electronics': ['gadgets', 'phones', 'laptops', 'accessories', 'tech'],
            'jewelry': ['jewellery', 'necklace', 'earrings', 'rings', 'accessories'],
            'fashion': ['clothing', 'style', 'trends', 'outfits', 'accessories']
        };

        const searchLower = searchQuery.toLowerCase();
        for (const [key, values] of Object.entries(keywords)) {
            if (searchLower.includes(key)) {
                return values;
            }
        }
        
        return ['Sarees', 'Lehenga', 'Electronics', 'Jewelry', 'Fashion', "men's clothing", "women's clothing"];
    };

    const relatedKeywords = getRelatedKeywords(query);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <SearchIcon className="h-6 w-6 text-gray-600" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        {query ? `Search Results for "${query}"` : 'All Products'}
                    </h1>
                </div>
                
                {/* Related Keywords */}
                {query && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <TagIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Related searches:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {relatedKeywords.map((keyword) => (
                                <Link
                                    key={keyword}
                                    href={`/search?query=${encodeURIComponent(keyword)}`}
                                    className="px-3 py-1 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full text-sm text-gray-700 transition-all duration-200"
                                >
                                    {keyword}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200">
                            <FilterIcon className="h-4 w-4" />
                            Filters
                        </button>
                        <div className="flex items-center gap-1">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                <GridIcon className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                <ListIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        {query && (
                            <span>Searching for: <span className="font-medium text-gray-900">"{query}"</span></span>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Results */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <SearchPage category={category} query={query} page={page} />
            </div>

            {/* Search Tips */}
            {query && (
                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Search Tips</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                            <p className="font-medium mb-2">💡 Try these search strategies:</p>
                            <ul className="space-y-1">
                                <li>• Use specific product names (e.g., "silk saree")</li>
                                <li>• Search by category (e.g., "men's clothing")</li>
                                <li>• Use brand names if you know them</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium mb-2">🔍 Popular categories:</p>
                            <ul className="space-y-1">
                                <li>• Traditional Wear (Sarees, Lehengas)</li>
                                <li>• Modern Fashion (Men's & Women's)</li>
                                <li>• Electronics & Gadgets</li>
                                <li>• Jewelry & Accessories</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 