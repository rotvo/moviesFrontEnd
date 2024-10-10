export interface ApiResponse<T>  {
    page:          number;
    total_results: number;
    total_pages:   number;
    results:       T[];
}

export interface Movie {
    id:           number;
    title:        string;
    release_date: Date;
    poster_path:  string;
    overview:     string;
    vote_average: number;
}

export interface Generes {
    id:   number;
    name: string;
}

export interface Rewview {
    user_rating: number;
    review:      string;
    created_at:  Date;
}

