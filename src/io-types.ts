import * as t from "io-ts";

import { either, fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { reporter } from "io-ts-reporters";

// original idea from https://github.com/hallettj/hacker-news-ts/blob/master/src/index.ts
// Apply a validator and get the result in a `Promise`
export function decodeToPromise<T, O, I>(
	validator: t.Type<T, O, I>,
	input: I,
): Promise<T> {
	const result = validator.decode(input);

	return pipe(
		validator.decode(input),
		fold(
			() => {
				const messages = reporter(result);
				return Promise.reject(new Error(messages.join("\n")));
			},
			(value: T) => Promise.resolve(value),
		),
	);
}

/**
 * Custom type
 *
 * A value of type Type<A, O, I> (called "codec") is the runtime representation of the static type A.
 * A codec can:
 *  decode inputs of type I (through decode)
 *  encode outputs of type O (through encode)
 *  be used as a custom type guard (through is)
 *
 * @see https://github.com/gcanti/io-ts#custom-types
 */
const ArrayFromCommaSeparatedStrings = new t.Type<string[], string, unknown>(
	"ArrayFromCommaSeparatedStrings",
	(u): u is string[] => u instanceof Array,
	(u, c) =>
		either.chain(
			t.string.validate(u, c),
			(s: string) => {
				const n = s.indexOf(",");
				return n === -1 ? t.failure(u, c, "cannot parse to an array") : t.success(s.split(","));
			}),
	(a) => a.toString(),
);


/**
 * [Rating validator and deserializer]
 */
const RatingV = t.type({
	Source: t.string,
	Value: t.string,
});

/**
 * [Movie Validator and Deserializer]
 */
export const MovieV = t.type({
	Genre: ArrayFromCommaSeparatedStrings,
	Rated: t.string,
	Ratings: t.array(RatingV),
	Released: t.string,
	Runtime: t.string,
	Title: t.string,
	Type: t.string,
	Year: t.string,
});

/**
 * [MovieDto data transfer object]
 * @type {[type]}
 */
export type MovieDto = t.TypeOf<typeof MovieV>;
export type RatingDto = t.TypeOf<typeof RatingV>;

