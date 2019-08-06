import { decodeToPromise, MovieDto, MovieV, RatingDto } from "./io-types";
import { PathReporter } from "io-ts/lib/PathReporter";
import { none, some, Option, toUndefined, fold } from "fp-ts/lib/Option";
import { isLeft } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

/**
 * [return on object literal (the outuput of a http://www.omdbapi.com/?apikey=[yourkey]&t=Chuck)]
 * @return {[object]} [ return movie object literal]
 */
const getMovieLiteral = () => {
  return { "Title": "Chuck", "Year": "2007–2012", "Rated": "TV-14", "Released": "24 Sep 2007", "Runtime": "43 min", "Genre": "Action, Comedy, Drama", "Director": "N/A", "Writer": "Chris Fedak, Josh Schwartz", "Actors": "Zachary Levi, Yvonne Strahovski, Joshua Gomez, Vik Sahay", "Plot": "When a twenty-something computer geek inadvertently downloads critical government secrets into his brain, the C.I.A. and the N.S.A. assign two agents to protect him and exploit such knowledge, turning his life upside down.", "Language": "English", "Country": "USA", "Awards": "Won 2 Primetime Emmys. Another 7 wins & 30 nominations.", "Poster": "https://m.media-amazon.com/images/M/MV5BMTM0ODIwNjI3NF5BMl5BanBnXkFtZTcwODU2ODUzMw@@._V1_SX300.jpg", "Ratings": [{ "Source": "Internet Movie Database", "Value": "8.2/10" }], "Metascore": "N/A", "imdbRating": "8.2", "imdbVotes": "120,989", "imdbID": "tt0934814", "Type": "series", "totalSeasons": "5", "Response": "True" };
};

/**
 * [decode object literal decoding function]
 * @type {Function}
 */
const decode = (movie: any): Option<MovieDto> => {
  console.log("try to decode a movie ", movie);
  const result = MovieV.decode(movie);
  if (isLeft(result)) {
    console.log(PathReporter.report(result));
  }
  return isLeft(result) ? none : some(result.right);
};

/**
 * [a function that take a DTO as argument]
 * @param  {[type]} movie: MovieDto      [description]
 * @return {[void]}                      [description]
 */
const printMessage = (movie: MovieDto) => {
  console.log(`Successfully decoded movie with title ${movie.Title} and genres: ${movie.Genre}`);
};

describe("types checking step by step", () => {
  it("try to decode a movie and call a typed function that handle a possible undefined parameter", () => {

    const logMovie = jest.fn((movie: MovieDto | undefined) => {
      if (!movie) {
        return;
      }
      printMessage(movie);
    });

    const movie: MovieDto | undefined = toUndefined(decode(getMovieLiteral()));

    expect(movie).not.toBe(undefined);

    logMovie(movie);

    expect(logMovie).toHaveReturned();

  });

  it("try to decode a movie and call a typed function. No undefined any more!", () => {

    const _logMovie = jest.fn((_movie: MovieDto) => {
      printMessage(_movie);
    });

    pipe(
      decode(getMovieLiteral()),
      fold(
        () => {
          expect(undefined).not.toBe(undefined);
        },
        (m: MovieDto) => {
          _logMovie(m);

          expect(_logMovie).toHaveReturned();
          expect(m.Genre.length > 0).toBeTruthy();
        },
      ),
    );

  });

  it("try to decode a movie getting a Promise. Wow!", async () => {

    expect.assertions(10);

    const moviedto: MovieDto = await decodeToPromise(MovieV, getMovieLiteral());

    expect(moviedto).toBeDefined();

    expect(moviedto.Genre).toBeDefined();
    expect(moviedto.Genre.length > 0).toBeTruthy();

    expect(moviedto.Ratings).toBeDefined();
    expect(moviedto.Ratings instanceof Array).toBeTruthy();
    expect(moviedto.Ratings[0]).toBeDefined();

    const ratingDto: RatingDto = moviedto.Ratings[0];

    expect(ratingDto.Value).toBeDefined();

    expect(ratingDto.Value.points).toBeDefined();
    expect(ratingDto.Value.scale).toBeDefined();

    expect(ratingDto.Value.points <= ratingDto.Value.scale).toBeTruthy();
  });

});
