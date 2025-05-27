/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Pagination, Table } from 'semantic-ui-react';
import Papa from 'papaparse';
import Frame from 'react-frame-component';

import styles from './CsvViewer.module.scss';

const ROWS_PER_PAGE = 50;

/* eslint-disable react/no-array-index-key */
const CsvViewer = React.memo(({ src, className }) => {
  const [csvData, setCsvData] = useState(null);
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

  const handlePageChange = useCallback((e, { activePage }) => {
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
          complete: (results) => {
            const rows = results.data;
            setCsvData({
              rows,
              totalRows: rows.length,
            });
          },
        });
      } catch (err) {
        setCsvData(null);
      }
    }

    fetchFile();
  }, [src]);

  if (!csvData) {
    return null;
  }

  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const endIdx = startIdx + ROWS_PER_PAGE;
  const currentRows = csvData.rows.slice(startIdx, endIdx);
  const totalPages = Math.ceil(csvData.totalRows / ROWS_PER_PAGE);

  const content = (
    <div>
      <div>
        <Table celled compact>
          <Table.Header>
            <Table.Row>
              {csvData.rows[0].map((header, index) => (
                <Table.HeaderCell key={index}>{header}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {currentRows.slice(1).map((row, rowIndex) => (
              <Table.Row key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <Table.Cell key={cellIndex}>{cell}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination
          activePage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          firstItem={null}
          lastItem={null}
          pointing
          secondary
          boundaryRange={1}
          siblingRange={1}
        />
      )}
    </div>
  );

  return (
    <Frame
      head={<style>{frameStyles.join('')}</style>}
      className={classNames(styles.wrapper, className)}
    >
      {content}
    </Frame>
  );
});
/* eslint-enable react/no-array-index-key */

CsvViewer.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string,
};

CsvViewer.defaultProps = {
  className: undefined,
};

export default CsvViewer;
