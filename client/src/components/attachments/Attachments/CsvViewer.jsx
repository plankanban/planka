/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Papa from 'papaparse';
import Frame from 'react-frame-component';
import { Loader, Pagination, Table } from 'semantic-ui-react';

import styles from './CsvViewer.module.scss';

const ROWS_PER_PAGE = 50;

const CsvViewer = React.memo(({ src, className }) => {
  const [rows, setRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const frameStyles = useMemo(
    () => [
      ...Array.from(document.styleSheets).flatMap((styleSheet) =>
        Array.from(styleSheet.cssRules).map((cssRule) => cssRule.cssText),
      ),
      'body{background:rgb(248,248,248);min-width:fit-content;overflow-x:visible}',
      '.frame-content{padding:40px}',
      '.frame-content>pre{margin:0}',
      '.hljs{padding:0}',
      '::-webkit-scrollbar{height:10px}',
      '.ui.pagination.menu{display:flex;justify-content:center;margin-top:20px;padding:10px 0}',
    ],
    [],
  );

  const handlePageChange = useCallback((_, { activePage }) => {
    setCurrentPage(activePage);
  }, []);

  useEffect(() => {
    async function fetchFile() {
      try {
        const response = await fetch(src, {
          credentials: 'include',
        });

        const text = await response.text();

        Papa.parse(text, {
          skipEmptyLines: true,
          complete: ({ data }) => {
            setRows(data);
          },
        });
      } catch {
        /* empty */
      }
    }

    fetchFile();
  }, [src]);

  if (rows === null) {
    return <Loader active size="big" />;
  }

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRows = rows.slice(startIndex, endIndex);
  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);

  return (
    <Frame
      head={<style>{frameStyles.join('')}</style>}
      className={classNames(styles.wrapper, className)}
    >
      <div>
        <Table celled compact>
          <Table.Header>
            <Table.Row>
              {rows[0].map((cell) => (
                <Table.HeaderCell key={cell}>{cell}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {currentRows.slice(1).map((row) => (
              <Table.Row key={row}>
                {row.map((cell) => (
                  <Table.Cell key={cell}>{cell}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination
          secondary
          pointing
          totalPages={totalPages}
          activePage={currentPage}
          firstItem={null}
          lastItem={null}
          onPageChange={handlePageChange}
        />
      )}
    </Frame>
  );
});

CsvViewer.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string,
};

CsvViewer.defaultProps = {
  className: undefined,
};

export default CsvViewer;
