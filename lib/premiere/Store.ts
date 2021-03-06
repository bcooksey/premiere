import Api from './Api';
import Model from './Model';
import Cache from './Cache';
import Hash from './Hash';

export interface IStoreFetch {
    ignoreCache?: boolean;
    url?: string;
    permit?: boolean;
}

export interface IStoreSet {
    url?: string;
}

export interface IStoreForeign {
    ignoreCache?: boolean;
    url?: string;
    set?: boolean;
    permit?: boolean;
}

export interface IStoreAct {
    url?: string;
    data?: Hash<any>;
    method?: string;
    permit?: boolean;
}

/**
 * A Store is an Api that handles the requests for a given Model
 */
export default class Store<T> extends Api {
    /**
     * The model associated with the Store
     */
    model: typeof Model;

    /**
     * The default methods allowed by the store
     * If none given, all will be allowed
     */
    allows: String[];
    /**
     * The default methods denied by the store
     * If none given, all will be allowed
     */
    denies: String[];

    /**
     * If true, the results from `index` will be stored in the cache as objects
     */
    setIndex: boolean;

    constructor(model: typeof Model, properties: Hash<any> = {}) {
        super(properties);
        this.model = model;

        if (model && !model.store) {
            model.store = this as any;
        }
    }

    /**
     * @inheritDoc
     */
    path(): string {
        return this.model.path;
    }

    /**
     * Check if method is allowed
     */
    isMethodAllowed(method: string): boolean {
        if (this.denies && this.denies.indexOf(method) !== -1) {
            return false;
        }
        return !this.allows || this.allows.indexOf(method) !== -1;
    }

    /**
     * Verify if a method can be executed. If it can't, throw an error
     * @throws Error
     */
    verifyPermission(method: string): void {
        if (!this.isMethodAllowed(method)) {
            let message = `Method '${method}' is not allowed in '${this.path()}' store`;
            throw new Error(message);
        }
    }

    /**
     * Get new model instance
     */
    make(values: Hash<any> | Hash<any>[], normalize: boolean = true): Model | Model[] {
        return this.model.make(values, normalize);
    }

    /**
     * Get index
     */
    index(options: IStoreFetch = {}): Promise<T[]> {
        if (!options.permit) {
            this.verifyPermission('index');
        }

        let url = options.url || '';
        return this.cachePromise(`index/${url}`, (resolve, reject) => {
            let list = this.cache.getList(`index/${url}`);
            if (!options.ignoreCache && list) {
                if (list) {
                    return resolve(list);
                }
            }

            let promise = this.http().get(url);
            promise.then(response => {
                let list = this.make(response.data) as Model[];
                this.cache.setList(`index/${url}`, list);
                if (this.setIndex) {
                    this.cache.set(list, false);
                }

                resolve(list);
            }, reject);
        });
    }

    /**
     * Make http get request
     */
    get(key: any, options: IStoreFetch = {}): Promise<T> {
        if (!options.permit) {
            this.verifyPermission('get');
        }

        key = Cache.resolveKey(key);
        let url = options.url || key.toString();

        return this.cachePromise(`get/${url}`, (resolve, reject) => {
            if (!options.ignoreCache) {
                let object = this.cache.get(key);
                if (object) {
                    return resolve(object);
                }
            }

            let promise = this.http().get(url);
            promise.then(response => {
                let instance = this.make(response.data);
                resolve(this.cache.set(instance, false));
            }, reject);
        });
    }

    /**
     * Make http get request to fetch by property
     */
    where(property: string, value: any, options: IStoreFetch = {}): Promise<T> {
        if (!options.permit) {
            this.verifyPermission('where');
        }

        let url = options.url;
        if (!options.url) {
            url = `${property}/${value}`;
        }

        return this.cachePromise(`where/${url}`, (resolve, reject) => {
            if (!options.ignoreCache) {
                let object = this.cache.where(property, value);
                if (object) {
                    return resolve(object);
                }
            }

            let promise = this.http().get(url);
            promise.then(response => {
                let instance = this.make(response.data);
                resolve(this.cache.set(instance, false));
            }, reject);
        });
    }

    /**
     * Make http post request
     */
    create(data: Hash<any>, options: IStoreSet = {}): Promise<T> {
        this.verifyPermission('create');

        let promise = this.http().post(options.url || '', data);
        return new Promise((resolve, reject) => {
            promise.then((response) => {
                let instance = this.make(response.data);
                resolve(this.cache.set(instance));
            }, reject);
        });
    }

    /**
     * Make http put request
     */
    update(data: Hash<any>, options: IStoreSet = {}): Promise<T> {
        this.verifyPermission('update');

        return new Promise((resolve, reject) => {
            let promise = this.http().put(options.url || data[this.model.keyColumn].toString(), data);
            promise.then((response) => {
                let instance = this.make(response.data);
                resolve(this.cache.set(instance));
            }, reject);
        });
    }

    /**
     * Make http request to destroy model
     */
    destroy(value: Model | any, options: IStoreSet = {}): Promise<any> {
        this.verifyPermission('destroy');

        let id = Cache.resolveKey(value);
        let promise = this.http().delete(options.url || id);

        promise.then(() => this.cache.destroy(id));

        return promise as Promise<any>;
    }

    /**
     * Call foreign method of store associated with given model
     */
    by(model: typeof Model, key: any, options: IStoreForeign = {}): Promise<T[]> {
        return model.resolveStore().foreign(this.model, key, options) as any;
    }

    /**
     * Make http request to fetch instances by foreign key
     */
    foreign(model: typeof Model, key: any, options: IStoreForeign = {}): Promise<Model[]> {
        if (!options.permit) {
            this.verifyPermission('foreign');
        }

        key = Cache.resolveKey(key);
        let url = options.url || `${key}/${model.path}`;

        return this.cachePromise(`foreign/${url}`, ((resolve, reject) => {
            let store = model.resolveStore();
            let list = store.cache.getList(url);
            if (!options.ignoreCache && list) {
                return resolve(list);
            }

            this.http().get(url).then((response: any) => {
                resolve(store.resolveForeign(response.data, Object.assign(options, {url})));
            }, reject);
        }));
    }

    /**
     * Resolve result from foreign method
     */
    protected resolveForeign(data: Hash<any> | Hash<any>[], options: IStoreForeign): Model[] {
        if (!Array.isArray(data)) {
            data = [data];
        }

        let result = this.make(data) as Model[];

        this.cache.setList(options.url, result as Model[]);
        if (options.set) {
            this.cache.set(result, false);
        }

        return result;
    }

    /**
     * Make http to act
     */
    act(key: any, action: string, options: IStoreAct = {}): Promise<any> {
        if (!options.permit) {
            this.verifyPermission('act');
        }

        key = Cache.resolveKey(key);

        let url = options.url || `${key}/${action}`;
        let method = (<any> this.http())[options.method || 'put'];
        return method(url, options.data);
    }
}
