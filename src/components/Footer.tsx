const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="transition hover:text-primary-600">
            Privacy
          </a>
          <a href="#" className="transition hover:text-primary-600">
            Terms
          </a>
          <a href="#" className="transition hover:text-primary-600">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
