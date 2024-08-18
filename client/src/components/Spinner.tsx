import React from "react";

interface Props {}

const Spinner = (props: Props) => {
    return (
        <div
            className="animate-spin inline-block w-5 h-5 border-[3px] border-current border-t-transparent text-primaryText rounded-full "
            role="status"
            aria-label="loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;
