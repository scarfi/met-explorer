import React from 'react';
import {
  Button,
  Text,
  Flex,
} from "@chakra-ui/react";

interface PaginationProps {
    total: number; // Total number of pages
    current: number; // Current page number
    onChange: (page: number) => void; // Callback to handle page change
}

const Pagination: React.FC<PaginationProps> = ({ total, current, onChange }) => {
  // Determine pages to always show
  const firstPage = 1;
  const lastPage = total;

  // Calculate potential boundary numbers
  const prevPage = current - 1;
  const nextPage = current + 1;

  const pages = [
    firstPage === current ? null : firstPage,
    ...(prevPage > firstPage + 1 ? ['...'] : []),
    (prevPage > firstPage) ? prevPage : null,
    current,
    (nextPage < lastPage) ? nextPage : null,
    ...(nextPage < lastPage - 1 ? ['...'] : []),
    lastPage === current ? null : lastPage,
  ].filter(page => page !== null);

  return (
    <Flex className="pagination"
      alignItems="center"
    >
      <Button
        colorScheme="brand"
        disabled={current === firstPage}
        onClick={() => onChange(current - 1)}
        borderRadius="5px 0 0 5px"
    >
        &lt;
      </Button>

      {pages.map((page, idx) => {
        if (page === '...') {
          return <Text mx="3" mb="2"
            color="#EC012A"
          >
            ...
          </Text>
        }
        return (
          <Button
            key={idx}
            variant={page === current ? 'solid' : 'outline'}
            backgroundColor={page !== current ? 'rgba(255, 255, 255, .4)' : undefined}
            colorScheme="brand"
            disabled={page === current || page === null}
            onClick={() => typeof page === 'number' && onChange(page)}
            borderRadius="0"
        >
            {page}
          </Button>
        );
      })}
      <Button
          colorScheme="brand"
          disabled={current === lastPage}
          onClick={() => onChange(current + 1)}
          borderRadius="0 5px 5px 0"
      >
          &gt;
      </Button>
    </Flex>
  );
};

export default Pagination;
