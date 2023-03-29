import MapPage from "@/components/MapPage/MapPage";
import { getSchoolSlugsList, loadSchoolData } from "@/utils/dataCache";
import { GetStaticProps, GetStaticPaths } from "next";
import { Municipality } from "@/types/data";

export default ({ municipalities }: SchoolPageProps) => {
  return <MapPage municipalities={municipalities} />;
};

interface SchoolPageProps {
  municipalities: Municipality[];
}

export const getStaticProps: GetStaticProps<SchoolPageProps> = async (
  context
) => {
  console.log("[municipality]");
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
