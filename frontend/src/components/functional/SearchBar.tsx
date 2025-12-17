'use client'

import { SearchIcon, X } from "lucide-react";
import { Input } from "../ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "../ui/button";
import toast, { Toaster } from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

interface SearchBarProps{
    
}

type SearchBar={
    query:string
}

function SearchBarComponent({}:SearchBarProps ){
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const router = useRouter();
    const [isFocused, setIsFocused] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [mounted, setMounted] = useState(false);

    const {register, handleSubmit, formState: { errors }, setValue, watch} = useForm<SearchBar>({
        defaultValues: {
            query: ''
        }
    });

    const watchedQuery = watch('query');

    useEffect(() => {
        setMounted(true);
        const query = searchParams.get('query')?.toString() || '';
        setSearchValue(query);
        setValue('query', query);
    }, [searchParams, setValue]);

    useEffect(() => {
        setSearchValue(watchedQuery || '');
    }, [watchedQuery]);

    if (!mounted) {
        return (
            <div className="w-full">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        placeholder="Search products.."
                        className="pl-12 pr-12 py-3 rounded-3xl border-gray-200 bg-white"
                        disabled
                    />
                </div>
            </div>
        );
    }

    const onSubmit: SubmitHandler<SearchBar> = async(data) => {
        if (!data.query || !data.query.trim()) {
            toast.error('Please enter a search term');
            return;
        }

        const params = new URLSearchParams(searchParams);
        if (data.query.trim()) {
            params.set('query', data.query.trim());
            params.set('page', '1');
        }

        if(pathname == '/'){
            replace(`/search?${params.toString()}`);
        } else if(pathname.includes('search')){
            replace(`${pathname}?${params.toString()}`);
        } else {
            params.delete('category');
            replace(`/search?${params.toString()}`);
        }
    };

    const clearSearch = () => {
        setValue('query', '');
        setSearchValue('');
        const params = new URLSearchParams(searchParams);
        params.delete('query');
        params.delete('page');
        replace(`${pathname}?${params.toString()}`);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(onSubmit)();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        setValue('query', value);
    };

    return(
        <>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="relative w-full">
                    <div className="relative">
                        <SearchIcon className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                            isFocused ? 'text-gray-900' : 'text-gray-400'
                        }`} />
                        
                        <Input 
                            {...register('query', {
                                required: {value: true, message: 'Please enter a search term!'},
                                minLength: {value: 2, message: 'Search term must be at least 2 characters!'}
                            })}
                            type="search" 
                            name="query" 
                            id="query"
                            placeholder="Search products.."
                            className={`pl-12 pr-12 py-3 rounded-3xl transition-all duration-200 text-base ${
                                isFocused 
                                    ? 'border-gray-900 shadow-lg shadow-gray-200' 
                                    : 'border-gray-200 hover:border-gray-300'
                            } focus:outline-none focus:ring-0 focus:border-gray-900 bg-white`}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyPress={handleKeyPress}
                            value={searchValue}
                            onChange={handleInputChange}
                        />
                        
                        {searchValue && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                    
                    {/* Search Button - Mobile */}
                    <Button 
                        type="submit" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-all duration-200 md:hidden"
                    >
                        Search
                    </Button>
                </div>
            </form>
            
            {/* Error Messages */}
            {errors.query && (
                <div className="mt-2 text-red-500 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{errors.query.message}</span>
                </div>
            )}
            
            {/* Search Tips */}
            {isFocused && !searchValue && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                    <div className="text-sm text-gray-600 mb-2 font-medium">Popular searches:</div>
                    <div className="flex flex-wrap gap-2">
                        {['Sarees', 'Lehenga', 'Electronics', 'Jewelry', 'Fashion', "men's clothing", "women's clothing"].map((term) => (
                            <button
                                key={term}
                                type="button"
                                onClick={() => {
                                    setValue('query', term);
                                    setSearchValue(term);
                                    handleSubmit(onSubmit)();
                                }}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors duration-200"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <Toaster 
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
        </>
    )
}

export default function SearchBar(props: SearchBarProps) {
    return (
        <Suspense fallback={<Input placeholder="Search..." className="w-full" />}>
            <SearchBarComponent {...props} />
        </Suspense>
    )
}