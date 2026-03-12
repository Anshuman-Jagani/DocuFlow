import React from 'react';

interface PaginationProps {
  currentPage: number; totalPages: number; totalItems: number;
  itemsPerPage: number; onPageChange: (page: number) => void; onItemsPerPageChange: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else if (currentPage <= 4) { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
    else if (currentPage >= totalPages - 3) { pages.push(1); pages.push('...'); for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i); }
    else { pages.push(1); pages.push('...'); for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  const navBtn = 'relative inline-flex items-center px-2 py-2 text-[#333333] bg-black border-r border-[#111111] hover:bg-[#0A0A0A] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center justify-between border-t border-[#111111] bg-black px-4 py-3 sm:px-6 rounded-b-lg">
      {/* Mobile */}
      <div className="flex flex-1 justify-between sm:hidden">
        {[['Previous', currentPage - 1, currentPage === 1], ['Next', currentPage + 1, currentPage === totalPages]].map(([label, page, disabled]) => (
          <button key={label as string} onClick={() => onPageChange(page as number)} disabled={disabled as boolean}
            className="inline-flex items-center rounded-md border border-[#111111] bg-[#0A0A0A] px-4 py-2 text-xs font-medium text-[#555555] hover:bg-[#111111] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            {label}
          </button>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-[11px] text-[#333333]">
            Showing <span className="font-bold text-white">{startItem}</span> — <span className="font-bold text-white">{endItem}</span> of <span className="font-bold text-white">{totalItems}</span>
          </p>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-[#222222] uppercase tracking-widest">Per page</label>
            <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-md border border-[#111111] bg-[#0A0A0A] text-white py-1 pl-3 pr-6 text-xs focus:border-white/20 focus:outline-none transition-colors">
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <nav className="isolate inline-flex -space-x-px rounded-md overflow-hidden border border-[#111111]">
          {/* First, Prev, Pages, Next, Last */}
          {[
            { label: '«', page: 1, disabled: currentPage === 1 },
            { label: '‹', page: currentPage - 1, disabled: currentPage === 1 },
          ].map(({ label, page, disabled }) => (
            <button key={label} onClick={() => onPageChange(page)} disabled={disabled} className={navBtn}>
              <span className="text-xs font-bold px-1">{label}</span>
            </button>
          ))}

          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="relative inline-flex items-center px-4 py-2 text-[10px] text-[#222222] bg-black border-r border-[#111111]">···</span>
              ) : (
                <button onClick={() => onPageChange(page as number)}
                  className={`relative inline-flex items-center px-4 py-2 text-xs font-bold border-r border-[#111111] transition-colors ${currentPage === page ? 'bg-white text-black' : 'bg-black text-[#444444] hover:bg-[#0A0A0A] hover:text-white'}`}>
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          {[
            { label: '›', page: currentPage + 1, disabled: currentPage === totalPages },
            { label: '»', page: totalPages, disabled: currentPage === totalPages },
          ].map(({ label, page, disabled }) => (
            <button key={label} onClick={() => onPageChange(page)} disabled={disabled} className={navBtn}>
              <span className="text-xs font-bold px-1">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
