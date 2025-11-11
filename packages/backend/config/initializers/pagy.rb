require 'pagy/extras/headers'
require 'pagy/extras/metadata'

Pagy::DEFAULT[:limit]       = 20                    # default
Pagy::DEFAULT[:size]        = 7                     # default
Pagy::DEFAULT[:ends]        = true                  # default
Pagy::DEFAULT[:page_param]  = :page                 # default
Pagy::DEFAULT[:count_args]  = []                    # example for non AR ORMs
Pagy::DEFAULT[:max_pages]   = 3000                  # example