import {
    ComputedValue,
    IComputedValueOptions,
    Annotation,
    storeAnnotation,
    createDecoratorAnnotation,
    isStringish,
    isPlainObject,
    isFunction,
    die,
    IComputedValue,
    createComputedAnnotation,
    comparer
} from "../internal"

export const COMPUTED = "computed"
export const COMPUTED_STRUCT = "computed.struct"

export interface IComputedFactory extends Annotation, PropertyDecorator {
    // @computed(opts)
    <T>(options: IComputedValueOptions<T>): Annotation & PropertyDecorator
    // computed(fn, opts)
    <T>(func: () => T, options?: IComputedValueOptions<T>): IComputedValue<T>

    struct: Annotation & PropertyDecorator
}

const computedAnnotation = createComputedAnnotation(COMPUTED)
const computedStructAnnotation = createComputedAnnotation(COMPUTED_STRUCT, {
    equals: comparer.structural
})

/**
 * Decorator for class properties: @computed get value() { return expr; }.
 * For legacy purposes also invokable as ES5 observable created: `computed(() => expr)`;
 */
export const computed: IComputedFactory = function computed(arg1, arg2) {
    if (isStringish(arg2)) {
        // @computed
        return storeAnnotation(arg1, arg2, computedAnnotation)
    }
    if (isPlainObject(arg1)) {
        // @computed({ options })
        return createDecoratorAnnotation(createComputedAnnotation(COMPUTED, arg1))
    }

    // computed(expr, options?)
    if (__DEV__) {
        if (!isFunction(arg1)) {
            die("First argument to `computed` should be an expression.")
        }
        if (isFunction(arg2)) {
            die(
                "A setter as second argument is no longer supported, use `{ set: fn }` option instead"
            )
        }
    }
    const opts: IComputedValueOptions<any> = isPlainObject(arg2) ? arg2 : {}
    opts.get = arg1
    if (!opts.name) {
        opts.name = arg1.name || "" /* for generated name */
    }

    return new ComputedValue(opts)
} as any

Object.assign(computed, computedAnnotation)

computed.struct = createDecoratorAnnotation(computedStructAnnotation)
