import { FormSchema } from "@/lib/formSchema";
import { Queries, getRandomQueries } from "@/lib/queries";
import { useEffect, useState } from "react";
import * as z from "zod";

interface Props {
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
}

/**
 * Renders a conversation starter component having some sample queries from queries.json file.
 * @param onSubmit - Function to be called when a query is submitted.
 */
const ConversationStarter = ({ onSubmit }: Props) => {
  const [randomQueries, setRandomQueries] = useState<
    { id: number; query: string }[]
  >([]);

  useEffect(() => {
    const queries = getRandomQueries(Queries, 4);
    setRandomQueries(queries);
  }, []);

  return (
    <div className="grid w-full gap-2 md:grid-cols-2 md:gap-4">
      {randomQueries?.map((query) => (
        <div
          key={query.id}
          onClick={() => onSubmit({ query: query.query })}
          className=" group relative flex w-full cursor-pointer select-none items-center justify-center rounded-[16px] bg-primaryGray bg-opacity-60 p-4 text-center shadow-none backdrop-blur-[50px] transition-all duration-200 ease-in-out hover:bg-opacity-90 md:h-[86px] lg:p-8"
        >
          <p className="transition-200 text-sm font-semibold text-primaryText group-hover:text-white">
            {query?.query}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ConversationStarter;
