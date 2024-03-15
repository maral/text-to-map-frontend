import MapPage from "@/components/OldMap/MapPage";
import { getSchoolSlugsList, loadSchoolData } from "@/utils/dataCache";
import { GetStaticProps, GetStaticPaths } from "next";
import { Municipality } from "@/types/data";
import { PageType } from "@/types/page";

const SchoolPage = ({ municipalities }: SchoolPageProps) => {
  return <MapPage municipalities={municipalities} pageType={PageType.School} />;
};
SchoolPage.displayName = "SchoolPage";

export default SchoolPage;

interface SchoolPageProps {
  municipalities: Municipality[];
}

export const getStaticProps: GetStaticProps<SchoolPageProps> = async (
  context
) => {
  if (!context.params) {
    return {
      notFound: true,
    };
  }

  const schoolSlug = context.params.school as string;
  const municipality = loadSchoolData(schoolSlug);

  if (!municipality) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      municipalities: [municipality],
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const schools = getSchoolSlugsList();

  const paths = schools.map((school: string) => ({
    params: { school },
  }));

  return { paths, fallback: false };
};
